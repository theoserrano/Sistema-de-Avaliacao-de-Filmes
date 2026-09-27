# backend/app/db/seed.py
"""
Script de carga inicial (seed) do banco de dados RocketLab.

Estratégia:
  - Se já existirem filmes, tenta apenas completar reviews/summary faltantes (modo reparo).
  - Caso contrário, executa a carga completa em ordem topológica.
  - Os campos `diretor` e `genero` em DimMovie são populados a partir das
    tabelas bridge + dim_people e bridge + dim_genres, respectivamente.
"""
import csv
import asyncio
from collections import defaultdict
from datetime import datetime
from decimal import Decimal, InvalidOperation
from pathlib import Path

from sqlalchemy import select
from app.db.base import Base
from app.db.session import AsyncSessionLocal, engine
import app.movies.models  # noqa: F401  — garante que Base.metadata está populado

from app.movies.models import (
    DimMovie, DimGenre, DimCompany, DimPerson,
    FactMoviePerformance, DimReview, MovieReview,
    bridge_movie_genre, bridge_movie_company, bridge_movie_person,
)

# O diretório data/ fica em backend/data/ — mesmo nível que app/
DATA_DIR = Path(__file__).resolve().parent.parent.parent / "data"


# ---------------------------------------------------------------------------
# Helpers de conversão robustos
# ---------------------------------------------------------------------------

def parse_date(val: str | None):
    if not val or str(val).strip() == "":
        return None
    try:
        return datetime.strptime(val.strip(), "%Y-%m-%d").date()
    except ValueError:
        return None


def parse_int(val) -> int | None:
    """Aceita inteiros, floats e strings como '2375.0'."""
    if val is None or str(val).strip() == "":
        return None
    try:
        return int(float(str(val).strip()))
    except (ValueError, TypeError):
        return None


def parse_float(val) -> float | None:
    if val is None or str(val).strip() == "":
        return None
    try:
        return float(str(val).strip())
    except (ValueError, TypeError):
        return None


def parse_decimal(val) -> Decimal | None:
    if val is None or str(val).strip() == "":
        return None
    try:
        return Decimal(str(val).strip())
    except (InvalidOperation, TypeError):
        return None


# ---------------------------------------------------------------------------
# Seed principal
# ---------------------------------------------------------------------------

async def seed():
    # Cria as tabelas se ainda não existirem (idempotente)
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    async with AsyncSessionLocal() as session:

        # ------------------------------------------------------------------ #
        # MODO REPARO: se já existem filmes, apenas completa dados faltantes  #
        # ------------------------------------------------------------------ #
        check = await session.execute(select(DimMovie))
        if check.scalars().first():
            print("Banco já populado — iniciando modo de reparo...")

            movie_ids = set(
                (await session.execute(select(DimMovie.sk_movie_id))).scalars().all()
            )
            existing_review_ids = set(
                (await session.execute(select(MovieReview.sk_movie_review_id))).scalars().all()
            )
            existing_summary_movie_ids = set(
                (await session.execute(select(DimReview.sk_movie_id))).scalars().all()
            )
            existing_summary_ids = set(
                (await session.execute(select(DimReview.sk_review_id))).scalars().all()
            )

            # --- reviews ---
            review_inserted = review_skipped = review_orphans = 0
            seen_review_ids = set(existing_review_ids)
            with open(DATA_DIR / "movies_reviews.csv", encoding="utf-8") as f:
                for r in csv.DictReader(f):
                    if r["sk_movie_id"] not in movie_ids:
                        review_orphans += 1
                    elif r["sk_movie_review_id"] in seen_review_ids:
                        review_skipped += 1
                    else:
                        session.add(MovieReview(
                            sk_movie_review_id=r["sk_movie_review_id"],
                            sk_movie_id=r["sk_movie_id"],
                            nome=r["nome"],
                            nota=parse_float(r["nota"]),
                            comentario=r["comentario"],
                        ))
                        seen_review_ids.add(r["sk_movie_review_id"])
                        review_inserted += 1

            # --- dim_reviews (summary) ---
            summary_inserted = summary_skipped = summary_orphans = 0
            with open(DATA_DIR / "dim_reviews.csv", encoding="utf-8") as f:
                for r in csv.DictReader(f):
                    if r["sk_movie_id"] not in movie_ids:
                        summary_orphans += 1
                    elif (
                        r["sk_review_id"] in existing_summary_ids
                        or r["sk_movie_id"] in existing_summary_movie_ids
                    ):
                        summary_skipped += 1
                    else:
                        session.add(DimReview(
                            sk_review_id=r["sk_review_id"],
                            sk_movie_id=r["sk_movie_id"],
                            qtd_avaliacoes_usuarios=parse_int(r.get("qtd_avaliacoes_usuarios")) or 0,
                            nota_media_usuarios=parse_float(r.get("nota_media_usuarios")),
                        ))
                        existing_summary_ids.add(r["sk_review_id"])
                        existing_summary_movie_ids.add(r["sk_movie_id"])
                        summary_inserted += 1

            await session.commit()
            print(
                f"Reparo movie_reviews : inseridos={review_inserted}, "
                f"ignorados={review_skipped}, órfãos={review_orphans}"
            )
            print(
                f"Reparo dim_reviews   : inseridos={summary_inserted}, "
                f"ignorados={summary_skipped}, órfãos={summary_orphans}"
            )
            return

        # ------------------------------------------------------------------ #
        # CARGA COMPLETA                                                      #
        # ------------------------------------------------------------------ #
        print("Banco vazio — iniciando carga completa...")

        # --- Pré-carregar mapeamentos para diretor e genero ---
        # bridge_movie_person: {sk_movie_id: [sk_person_id]}
        movie_to_persons: dict[str, list[str]] = defaultdict(list)
        with open(DATA_DIR / "bridge_movie_person.csv", encoding="utf-8") as f:
            for r in csv.DictReader(f):
                movie_to_persons[r["sk_movie_id"]].append(r["sk_person_id"])

        # dim_people: {sk_person_id: (nome, tipo)}
        person_info: dict[str, tuple[str, str]] = {}
        with open(DATA_DIR / "dim_people.csv", encoding="utf-8") as f:
            for r in csv.DictReader(f):
                person_info[r["sk_person_id"]] = (r["nome_pessoa"], r["tipo_pessoa"])

        # bridge_movie_genre: {sk_movie_id: [sk_genre_id]}
        movie_to_genres: dict[str, list[str]] = defaultdict(list)
        with open(DATA_DIR / "bridge_movie_genre.csv", encoding="utf-8") as f:
            for r in csv.DictReader(f):
                movie_to_genres[r["sk_movie_id"]].append(r["sk_genre_id"])

        # dim_genres: {sk_genre_id: nome_genero}
        genre_names: dict[str, str] = {}
        with open(DATA_DIR / "dim_genres.csv", encoding="utf-8") as f:
            for r in csv.DictReader(f):
                genre_names[r["sk_genre_id"]] = r["nome_genero"]

        # Helper para extrair diretor e genero de um filme
        def get_diretor(sk_movie_id: str) -> str | None:
            diretores = [
                person_info[pid][0]
                for pid in movie_to_persons.get(sk_movie_id, [])
                if pid in person_info and person_info[pid][1] == "Diretor"
            ]
            return ", ".join(diretores) if diretores else None

        def get_genero(sk_movie_id: str) -> str | None:
            generos = [
                genre_names[gid]
                for gid in movie_to_genres.get(sk_movie_id, [])
                if gid in genre_names
            ]
            return ", ".join(generos) if generos else None

        # ---- 1. dim_movies -----------------------------------------------
        print("  [1/8] dim_movies...")
        with open(DATA_DIR / "dim_movies.csv", encoding="utf-8") as f:
            for r in csv.DictReader(f):
                sk = r["sk_movie_id"]
                session.add(DimMovie(
                    sk_movie_id=sk,
                    id_filme=r["id_filme"],
                    titulo=r["titulo"],
                    data_lancamento=parse_date(r.get("data_lancamento")),
                    ano_lancamento=parse_int(r.get("ano_lancamento")),
                    duracao_minutos=parse_int(r.get("duracao_minutos")),
                    status_filme=r.get("status_filme") or None,
                    sinopse=r.get("sinopse") or None,
                    url_poster=r.get("url_poster") or None,
                    url_backdrop=r.get("url_backdrop") or None,
                    diretor=get_diretor(sk),
                    genero=get_genero(sk),
                ))
        await session.commit()

        # ---- 2. dim_genres -----------------------------------------------
        print("  [2/8] dim_genres...")
        with open(DATA_DIR / "dim_genres.csv", encoding="utf-8") as f:
            for r in csv.DictReader(f):
                session.add(DimGenre(
                    sk_genre_id=r["sk_genre_id"],
                    nome_genero=r["nome_genero"],
                ))
        await session.commit()

        # ---- 3. dim_companies --------------------------------------------
        print("  [3/8] dim_companies...")
        with open(DATA_DIR / "dim_companies.csv", encoding="utf-8") as f:
            for r in csv.DictReader(f):
                session.add(DimCompany(
                    sk_company_id=r["sk_company_id"],
                    nome_produtora=r["nome_produtora"],
                ))
        await session.commit()

        # ---- 4. dim_people -----------------------------------------------
        print("  [4/8] dim_people...")
        with open(DATA_DIR / "dim_people.csv", encoding="utf-8") as f:
            for r in csv.DictReader(f):
                session.add(DimPerson(
                    sk_person_id=r["sk_person_id"],
                    nome_pessoa=r["nome_pessoa"],
                    tipo_pessoa=r["tipo_pessoa"],
                ))
        await session.commit()

        # ---- 5. fact_movies_performance ----------------------------------
        print("  [5/8] fact_movies_performance...")
        with open(DATA_DIR / "fact_movies_performance.csv", encoding="utf-8") as f:
            for r in csv.DictReader(f):
                session.add(FactMoviePerformance(
                    sk_movie_id=r["sk_movie_id"],
                    orcamento_usd=parse_decimal(r.get("orcamento_usd")),
                    receita_usd=parse_decimal(r.get("receita_usd")),
                    lucro_usd=parse_decimal(r.get("lucro_usd")) or Decimal(0),
                    orcamento_brl=parse_decimal(r.get("orcamento_brl")),
                    receita_brl=parse_decimal(r.get("receita_brl")),
                    lucro_brl=parse_decimal(r.get("lucro_brl")) or Decimal(0),
                    popularidade=parse_float(r.get("popularidade")),
                    nota_tmdb=parse_float(r.get("nota_tmdb")),
                    qtd_tmdb=parse_int(r.get("qtd_tmdb")),   # '2375.0' → 2375
                    nota_imdb=parse_float(r.get("nota_imdb")),
                    qtd_imdb=parse_int(r.get("qtd_imdb")),   # '46286.0' → 46286
                ))
        await session.commit()

        # ---- 6. dim_reviews (summary) ------------------------------------
        print("  [6/8] dim_reviews...")
        with open(DATA_DIR / "dim_reviews.csv", encoding="utf-8") as f:
            for r in csv.DictReader(f):
                session.add(DimReview(
                    sk_review_id=r["sk_review_id"],
                    sk_movie_id=r["sk_movie_id"],
                    qtd_avaliacoes_usuarios=parse_int(r.get("qtd_avaliacoes_usuarios")) or 0,
                    nota_media_usuarios=parse_float(r.get("nota_media_usuarios")),
                ))
        await session.commit()

        # ---- 7. movies_reviews -------------------------------------------
        print("  [7/8] movies_reviews...")
        with open(DATA_DIR / "movies_reviews.csv", encoding="utf-8") as f:
            for r in csv.DictReader(f):
                session.add(MovieReview(
                    sk_movie_review_id=r["sk_movie_review_id"],
                    sk_movie_id=r["sk_movie_id"],
                    nome=r["nome"],
                    nota=parse_float(r["nota"]),
                    comentario=r["comentario"],
                ))
        await session.commit()

        # ---- 8. bridges (N:N) --------------------------------------------
        print("  [8/8] bridges N:N (genre, company, person)...")

        with open(DATA_DIR / "bridge_movie_genre.csv", encoding="utf-8") as f:
            for r in csv.DictReader(f):
                await session.execute(bridge_movie_genre.insert().values(
                    sk_movie_id=r["sk_movie_id"],
                    sk_genre_id=r["sk_genre_id"],
                ))

        with open(DATA_DIR / "bridge_movie_company.csv", encoding="utf-8") as f:
            for r in csv.DictReader(f):
                await session.execute(bridge_movie_company.insert().values(
                    sk_movie_id=r["sk_movie_id"],
                    sk_company_id=r["sk_company_id"],
                ))

        with open(DATA_DIR / "bridge_movie_person.csv", encoding="utf-8") as f:
            for r in csv.DictReader(f):
                await session.execute(bridge_movie_person.insert().values(
                    sk_movie_id=r["sk_movie_id"],
                    sk_person_id=r["sk_person_id"],
                ))

        await session.commit()
        print("✅ Carga completa finalizada com sucesso!")


if __name__ == "__main__":
    asyncio.run(seed())