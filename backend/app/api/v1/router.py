from fastapi import APIRouter
from app.api.v1.movies import router as movies_router
from app.api.v1.reviews import router as reviews_router

api_router = APIRouter()

api_router.include_router(movies_router)
api_router.include_router(reviews_router)