from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload

from app.db.session import get_db
from app.movies import schemas
from app.movies.models import DimMovie

router = APIRouter(prefix="/movies", tags=["Movies"])


# 1. LISTAR FILMES (Com busca e média consolidada)
@router.get("", response_model=List[schemas.MovieResponse], status_code=status.HTTP_200_OK)
@router.get("/", response_model=List[schemas.MovieResponse], status_code=status.HTTP_200_OK, include_in_schema=False)
async def list_movies(
    skip: int = 0,
    limit: int = 10,
    search: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
):
    query = select(DimMovie).options(
        selectinload(DimMovie.reviews),
        selectinload(DimMovie.reviews_summary),
    )

    normalized_search = (search or "").strip()

    if normalized_search:
        query = query.where(DimMovie.titulo.ilike(f"%{normalized_search}%"))

    query = query.offset(skip).limit(limit)
    result = await db.execute(query)
    movies = result.scalars().all()

    for movie in movies:
        reviews = movie.reviews or []
        if reviews:
            total = len(reviews)
            movie.total_avaliacoes = total
            movie.media_avaliacoes = round(sum(r.nota for r in reviews) / total, 2)
        elif movie.reviews_summary:
            movie.total_avaliacoes = movie.reviews_summary.qtd_avaliacoes_usuarios or 0
            movie.media_avaliacoes = movie.reviews_summary.nota_media_usuarios or 0.0
        else:
            movie.total_avaliacoes = 0
            movie.media_avaliacoes = 0.0

    return movies


# 2. BUSCAR UM FILME POR ID
@router.get("/{sk_movie_id}", response_model=schemas.MovieResponse, status_code=status.HTTP_200_OK)
async def get_movie(sk_movie_id: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(DimMovie)
        .options(
            selectinload(DimMovie.reviews),
            selectinload(DimMovie.reviews_summary),
        )
        .where(DimMovie.sk_movie_id == sk_movie_id)
    )
    movie = result.scalar_one_or_none()

    if not movie:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Filme não encontrado",
        )

    reviews = movie.reviews or []
    if reviews:
        total = len(reviews)
        movie.total_avaliacoes = total
        movie.media_avaliacoes = round(sum(r.nota for r in reviews) / total, 2)
    elif movie.reviews_summary:
        movie.total_avaliacoes = movie.reviews_summary.qtd_avaliacoes_usuarios or 0
        movie.media_avaliacoes = movie.reviews_summary.nota_media_usuarios or 0.0
    else:
        movie.total_avaliacoes = 0
        movie.media_avaliacoes = 0.0

    return movie


# 3. CADASTRAR FILME
@router.post("/", response_model=schemas.MovieResponse, status_code=status.HTTP_201_CREATED)
async def create_movie(data: schemas.MovieCreate, db: AsyncSession = Depends(get_db)):
    movie = DimMovie(**data.model_dump())
    db.add(movie)

    try:
        await db.commit()
    except IntegrityError:
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Filme com este 'id_filme' já está cadastrado no sistema",
        ) from None

    await db.refresh(movie)
    return movie


# 4. ATUALIZAR FILME
@router.patch("/{sk_movie_id}", response_model=schemas.MovieResponse, status_code=status.HTTP_200_OK)
async def update_movie(
    sk_movie_id: str,
    data: schemas.MovieUpdate,
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(DimMovie).where(DimMovie.sk_movie_id == sk_movie_id))
    movie = result.scalar_one_or_none()

    if not movie:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Filme não encontrado para atualização",
        )

    update_data = data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(movie, field, value)

    try:
        await db.commit()
    except IntegrityError:
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Erro ao atualizar dados do filme",
        ) from None

    await db.refresh(movie)
    return movie


# 5. REMOVER FILME
@router.delete("/{sk_movie_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_movie(sk_movie_id: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(DimMovie).where(DimMovie.sk_movie_id == sk_movie_id))
    movie = result.scalar_one_or_none()

    if not movie:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Filme não encontrado",
        )

    await db.delete(movie)
    await db.commit()
    return None