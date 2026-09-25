from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from app.db.session import get_db
from app.movies import schemas
from app.movies.models import DimMovie, MovieReview

router = APIRouter(prefix="/movies", tags=["Reviews"])


# 1. LISTAR HISTÓRICO DE REVIEWS DE UM FILME (GET /movies/{sk_movie_id}/reviews)
@router.get("/{sk_movie_id}/reviews", response_model=List[schemas.ReviewResponse], status_code=status.HTTP_200_OK)
async def list_movie_reviews(sk_movie_id: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(DimMovie).where(DimMovie.sk_movie_id == sk_movie_id))
    movie = result.scalar_one_or_none()

    if not movie:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Filme não encontrado",
        )

    reviews_result = await db.execute(
        select(MovieReview)
        .where(MovieReview.sk_movie_id == sk_movie_id)
        .order_by(MovieReview.created_at.desc())
    )
    return reviews_result.scalars().all()


# 2. ADICIONAR AVALIAÇÃO E NOTA (POST /movies/{sk_movie_id}/reviews)
@router.post("/{sk_movie_id}/reviews", response_model=schemas.ReviewResponse, status_code=status.HTTP_201_CREATED)
async def create_review(
    sk_movie_id: str,
    data: schemas.ReviewCreate,
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(DimMovie).where(DimMovie.sk_movie_id == sk_movie_id))
    movie = result.scalar_one_or_none()

    if not movie:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Filme não encontrado para receber avaliação",
        )

    review = MovieReview(sk_movie_id=sk_movie_id, **data.model_dump())
    db.add(review)

    try:
        await db.commit()
    except IntegrityError:
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Erro de integridade ao cadastrar a avaliação",
        ) from None

    await db.refresh(review)
    return review