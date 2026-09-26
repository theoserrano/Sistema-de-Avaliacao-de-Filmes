# backend/app/db/seed.py
import csv
import asyncio
from datetime import datetime
from decimal import Decimal
from pathlib import Path

from sqlalchemy import select
from app.db.session import AsyncSessionLocal
from app.movies.models import (
    DimMovie, DimGenre, DimCompany, DimPerson,
    FactMoviePerformance, DimReview, MovieReview,
    bridge_movie_genre, bridge_movie_company, bridge_movie_person
)

DATA_DIR = Path(__file__).resolve().parent.parent.parent / "data"

def parse_date(date_str: str):
    if not date_str or date_str == "":
        return None
    try:
        return datetime.strptime(date_str, "%Y-%m-%d").date()
    except ValueError:
        return None

def parse_int(val: str):
    return int(val) if val and val.strip() != "" else None

def parse_float(val: str):
    return float(val) if val and val.strip() != "" else None

def parse_decimal(val: str):
    return Decimal(val) if val and val.strip() != "" else None

async def seed():
    async with AsyncSessionLocal() as session:
        check = await session.execute(select(DimMovie))
        if check.scalars().first():
            movie_ids = set(
                (await session.execute(select(DimMovie.sk_movie_id))).scalars().all()
            )
            existing_review_ids = set(
                (await session.execute(select(MovieReview.sk_movie_review_id))).scalars().all()
            )
            existing_summary_ids = set(
                (await session.execute(select(DimReview.sk_review_id))).scalars().all()
            )
            existing_summary_movie_ids = set(
                (await session.execute(select(DimReview.sk_movie_id))).scalars().all()
            )

            review_inserted = review_skipped = review_orphans = 0
            seen_review_ids = set(existing_review_ids)
            with open(DATA_DIR / "movies_reviews.csv", mode="r", encoding="utf-8") as f:
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
                            comentario=r["comentario"]
                        ))
                        seen_review_ids.add(r["sk_movie_review_id"])
                        review_inserted += 1

            summary_inserted = summary_skipped = summary_orphans = 0
            seen_summary_ids = set(existing_summary_ids)
            seen_summary_movie_ids = set(existing_summary_movie_ids)
            with open(DATA_DIR / "dim_reviews.csv", mode="r", encoding="utf-8") as f:
                for r in csv.DictReader(f):
                    if r["sk_movie_id"] not in movie_ids:
                        summary_orphans += 1
                    elif (
                        r["sk_review_id"] in seen_summary_ids
                        or r["sk_movie_id"] in seen_summary_movie_ids
                    ):
                        summary_skipped += 1
                    else:
                        session.add(DimReview(
                            sk_review_id=r["sk_review_id"],
                            sk_movie_id=r["sk_movie_id"],
                            qtd_avaliacoes_usuarios=parse_int(
                                r.get("qtd_avaliacoes_usuarios")
                            ) or 0,
                            nota_media_usuarios=parse_float(r.get("nota_media_usuarios"))
                        ))
                        seen_summary_ids.add(r["sk_review_id"])
                        seen_summary_movie_ids.add(r["sk_movie_id"])
                        summary_inserted += 1

            await session.commit()
            print(
                "Reparo de movie_reviews: "
                f"inseridos={review_inserted}, ignorados={review_skipped}, "
                f"órfãos={review_orphans}"
            )
            print(
                "Reparo de dim_reviews: "
                f"inseridos={summary_inserted}, ignorados={summary_skipped}, "
                f"órfãos={summary_orphans}"
            )
            return

        print("Lendo e inserindo dimensões...")

        # 1. dim_movies
        with open(DATA_DIR / "dim_movies.csv", mode="r", encoding="utf-8") as f:
            for r in csv.DictReader(f):
                session.add(DimMovie(
                    sk_movie_id=r["sk_movie_id"],
                    id_filme=r["id_filme"],
                    titulo=r["titulo"],
                    data_lancamento=parse_date(r.get("data_lancamento")),
                    ano_lancamento=parse_int(r.get("ano_lancamento")),
                    duracao_minutos=parse_int(r.get("duracao_minutos")),
                    status_filme=r.get("status_filme"),
                    sinopse=r.get("sinopse"),
                    url_poster=r.get("url_poster"),
                    url_backdrop=r.get("url_backdrop")
                ))
        await session.commit()

        # 2. dim_genres
        with open(DATA_DIR / "dim_genres.csv", mode="r", encoding="utf-8") as f:
            for r in csv.DictReader(f):
                session.add(DimGenre(
                    sk_genre_id=r["sk_genre_id"],
                    nome_genero=r["nome_genero"]
                ))
        await session.commit()

        # 3. dim_companies
        with open(DATA_DIR / "dim_companies.csv", mode="r", encoding="utf-8") as f:
            for r in csv.DictReader(f):
                session.add(DimCompany(
                    sk_company_id=r["sk_company_id"],
                    nome_produtora=r["nome_produtora"]
                ))
        await session.commit()

        # 4. dim_people
        with open(DATA_DIR / "dim_people.csv", mode="r", encoding="utf-8") as f:
            for r in csv.DictReader(f):
                session.add(DimPerson(
                    sk_person_id=r["sk_person_id"],
                    nome_pessoa=r["nome_pessoa"],
                    tipo_pessoa=r["tipo_pessoa"]
                ))
        await session.commit()

        print("Inserindo fatos e avaliações...")

        # 5. fact_movies_performance
        with open(DATA_DIR / "fact_movies_performance.csv", mode="r", encoding="utf-8") as f:
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
                    qtd_tmdb=parse_int(r.get("qtd_tmdb")),
                    nota_imdb=parse_float(r.get("nota_imdb")),
                    qtd_imdb=parse_int(r.get("qtd_imdb"))
                ))
        await session.commit()

        # 6. dim_reviews
        with open(DATA_DIR / "dim_reviews.csv", mode="r", encoding="utf-8") as f:
            for r in csv.DictReader(f):
                session.add(DimReview(
                    sk_review_id=r["sk_review_id"],
                    sk_movie_id=r["sk_movie_id"],
                    qtd_avaliacoes_usuarios=parse_int(r.get("qtd_avaliacoes_usuarios")) or 0,
                    nota_media_usuarios=parse_float(r.get("nota_media_usuarios"))
                ))
        await session.commit()

        # 7. movies_reviews
        with open(DATA_DIR / "movies_reviews.csv", mode="r", encoding="utf-8") as f:
            for r in csv.DictReader(f):
                session.add(MovieReview(
                    sk_movie_review_id=r["sk_movie_review_id"],
                    sk_movie_id=r["sk_movie_id"],
                    nome=r["nome"],
                    nota=parse_float(r["nota"]),
                    comentario=r["comentario"]
                ))
        await session.commit()

        print("Inserindo associações N:N...")

        # 8. bridge_movie_genre
        with open(DATA_DIR / "bridge_movie_genre.csv", mode="r", encoding="utf-8") as f:
            for r in csv.DictReader(f):
                await session.execute(bridge_movie_genre.insert().values(
                    sk_movie_id=r["sk_movie_id"],
                    sk_genre_id=r["sk_genre_id"]
                ))

        # 9. bridge_movie_company
        with open(DATA_DIR / "bridge_movie_company.csv", mode="r", encoding="utf-8") as f:
            for r in csv.DictReader(f):
                await session.execute(bridge_movie_company.insert().values(
                    sk_movie_id=r["sk_movie_id"],
                    sk_company_id=r["sk_company_id"]
                ))

        # 10. bridge_movie_person
        with open(DATA_DIR / "bridge_movie_person.csv", mode="r", encoding="utf-8") as f:
            for r in csv.DictReader(f):
                await session.execute(bridge_movie_person.insert().values(
                    sk_movie_id=r["sk_movie_id"],
                    sk_person_id=r["sk_person_id"]
                ))

        await session.commit()
        print("Carga completa finalizada com sucesso!")

if __name__ == "__main__":
    asyncio.run(seed())