# app/movies/schemas.py
from datetime import date, datetime
from typing import Optional, List
from pydantic import BaseModel, Field

# --- SCHEMAS DE AVALIAÇÕES (REVIEWS) ---
class ReviewCreate(BaseModel):
    nome: str = Field(..., min_length=2, max_length=120, description="Nome do usuário")
    nota: float = Field(..., ge=0.0, le=10.0, description="Nota do filme na escala de 0 a 10")
    comentario: str = Field(..., min_length=3, max_length=4000, description="Resenha textual")

class ReviewResponse(BaseModel):
    sk_movie_review_id: str
    sk_movie_id: str
    nome: str
    nota: float
    comentario: str
    created_at: datetime

    class Config:
        from_attributes = True

# --- SCHEMAS DE FILMES (MOVIES) ---
class MovieCreate(BaseModel):
    id_filme: str = Field(..., description="ID único externo do filme (ex: movie_101)")
    titulo: str = Field(..., min_length=1, max_length=500)
    data_lancamento: Optional[date] = None
    ano_lancamento: Optional[int] = None
    duracao_minutos: Optional[int] = None
    sinopse: Optional[str] = None
    url_poster: Optional[str] = None

class MovieUpdate(BaseModel):
    titulo: Optional[str] = None
    data_lancamento: Optional[date] = None
    ano_lancamento: Optional[int] = None
    duracao_minutos: Optional[int] = None
    sinopse: Optional[str] = None
    url_poster: Optional[str] = None

class MovieResponse(BaseModel):
    sk_movie_id: str
    id_filme: str
    titulo: str
    data_lancamento: Optional[date] = None
    ano_lancamento: Optional[int] = None
    duracao_minutos: Optional[int] = None
    sinopse: Optional[str] = None
    url_poster: Optional[str] = None
    media_avaliacoes: Optional[float] = 0.0
    total_avaliacoes: int = 0
    reviews: List[ReviewResponse] = Field(default_factory=list)

    class Config:
        from_attributes = True