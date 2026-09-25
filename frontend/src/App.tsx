import { useEffect, useState, type FormEvent } from 'react';
import './App.css';
import { MovieDetail } from './components/movies/MovieDetail';
import { MovieList } from './components/movies/MovieList';
import { SearchBar } from './components/movies/SearchBar';
import { useMovieMutations } from './hooks/useMovieMutations';
import { useMovies } from './hooks/useMovies';
import type { MovieCreateData } from './types/movie';

const createMovieDraft = (): MovieCreateData => ({
  id_filme: `movie_${Date.now()}`,
  titulo: '',
  data_lancamento: '2025-01-01',
  ano_lancamento: new Date().getFullYear(),
  duracao_minutos: 120,
  sinopse: 'Filme de teste criado para validação de integração com o backend.',
  url_poster: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=800&q=80',
});

function App() {
  const {
    movies,
    search,
    setSearch,
    loading: loadingMovies,
    error: moviesError,
    refresh: refreshMovies,
    loadMore,
    hasMore,
  } = useMovies('');

  const [selectedMovieId, setSelectedMovieId] = useState<string | null>(null);
  const [movieForm, setMovieForm] = useState<MovieCreateData>(createMovieDraft);

  const {
    createMovie,
    deleteMovie,
    isSubmitting,
    submitError,
  } = useMovieMutations();

  useEffect(() => {
    if (!selectedMovieId && movies.length > 0) {
      setSelectedMovieId(movies[0].sk_movie_id);
    }
  }, [movies, selectedMovieId]);

  const handleCreateMovie = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!movieForm.titulo.trim()) {
      return;
    }

    const createdMovie = await createMovie({
      ...movieForm,
      titulo: movieForm.titulo.trim(),
    });

    if (createdMovie) {
      console.log('[App] filme criado com sucesso', createdMovie);
      setMovieForm(createMovieDraft());
      setSelectedMovieId(createdMovie.sk_movie_id);
      await refreshMovies();
    }
  };

  const handleDeleteMovie = async (id: string) => {
    const deleted = await deleteMovie(id);

    if (deleted) {
      if (selectedMovieId === id) {
        setSelectedMovieId(null);
      }

      await refreshMovies();
    }
  };

  return (
    <main className="app-shell">
      <header className="topbar">
        <div>
          <p className="eyebrow">Sistema de avaliação de filmes</p>
          <h1>Validação de integração com backend</h1>
        </div>
        <button type="button" className="secondary-button" onClick={() => refreshMovies()}>
          Atualizar catálogo
        </button>
      </header>

      <section className="panel-grid">
        <aside className="panel left-panel">
          <div className="panel-header">
            <h2>Catálogo</h2>
            <SearchBar value={search} onChange={setSearch} />
          </div>

          <MovieList
            movies={movies}
            selectedMovieId={selectedMovieId}
            onSelectMovie={setSelectedMovieId}
            loading={loadingMovies}
            error={moviesError}
          />

          {hasMore && !loadingMovies && (
            <button type="button" className="primary-button" onClick={() => loadMore()}>
              Carregar mais
            </button>
          )}
        </aside>

        <section className="panel detail-panel">
          <MovieDetail selectedMovieId={selectedMovieId} onDeleteMovie={handleDeleteMovie} />
        </section>

        <aside className="panel right-panel">
          <h2>Criar filme de teste</h2>
          <form className="form-box" onSubmit={handleCreateMovie}>
            <input
              type="text"
              placeholder="Título"
              value={movieForm.titulo}
              onChange={(event) => setMovieForm((current) => ({ ...current, titulo: event.target.value }))}
            />
            <input
              type="text"
              placeholder="ID do filme"
              value={movieForm.id_filme}
              onChange={(event) => setMovieForm((current) => ({ ...current, id_filme: event.target.value }))}
            />
            <input
              type="text"
              placeholder="URL do poster"
              value={movieForm.url_poster || ''}
              onChange={(event) => setMovieForm((current) => ({ ...current, url_poster: event.target.value }))}
            />
            <input
              type="number"
              placeholder="Ano"
              value={movieForm.ano_lancamento ?? ''}
              onChange={(event) => setMovieForm((current) => ({ ...current, ano_lancamento: Number(event.target.value) }))}
            />
            <textarea
              rows={3}
              placeholder="Sinopse"
              value={movieForm.sinopse || ''}
              onChange={(event) => setMovieForm((current) => ({ ...current, sinopse: event.target.value }))}
            />
            <button type="submit" className="primary-button" disabled={isSubmitting}>
              {isSubmitting ? 'Enviando...' : 'Criar filme'}
            </button>
          </form>

          {submitError && <p className="state-message error">{submitError}</p>}
          {moviesError && <p className="state-message error">{moviesError}</p>}
        </aside>
      </section>
    </main>
  );
}

export default App;
