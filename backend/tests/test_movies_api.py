from fastapi.testclient import TestClient
from app.main import app
from app.movies.schemas import MovieCreate, ReviewCreate
import pytest
from pydantic import ValidationError

client = TestClient(app)


def test_get_movies_status():
    response = client.get("/api/v1/movies")
    assert response.status_code in [200, 404]


def test_create_movie_validation_error():
    # Payload vazio deve retornar status 422 Unprocessable Entity
    response = client.post("/api/v1/movies/", json={})
    assert response.status_code == 422


def test_movie_schema_fields():
    # Testa os campos 'diretor' e 'genero' no esquema de criação de filme
    movie_data = MovieCreate(
        id_filme="movie_test_01",
        titulo="Filme de Teste",
        diretor="Christopher Nolan",
        genero="Ficção Científica",
        duracao_minutos=148,
    )
    assert movie_data.id_filme == "movie_test_01"
    assert movie_data.titulo == "Filme de Teste"
    assert movie_data.diretor == "Christopher Nolan"
    assert movie_data.genero == "Ficção Científica"


def test_review_schema_nota_validation():
    # A nota deve estar na escala de 0.0 a 10.0
    valid_review = ReviewCreate(
        nome="João Silva",
        nota=8.5,
        comentario="Excelente filme!",
    )
    assert valid_review.nota == 8.5

    # Nota maior que 10 deve lançar erro de validação
    with pytest.raises(ValidationError):
        ReviewCreate(
            nome="João Silva",
            nota=11.0,
            comentario="Inválido",
        )

    # Nota menor que 0 deve lançar erro de validação
    with pytest.raises(ValidationError):
        ReviewCreate(
            nome="João Silva",
            nota=-1.0,
            comentario="Inválido",
        )