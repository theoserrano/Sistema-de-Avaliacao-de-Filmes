import pytest_asyncio
from app.db.base import Base
from app.db.session import engine
import app.movies.models  # noqa: F401 (Registra todos os modelos ORM no Base.metadata)


@pytest_asyncio.fixture(scope="session", autouse=True)
async def setup_database():
    """Cria todas as tabelas no banco de dados antes da execução da suíte de testes."""
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield
