import { useEffect, useState } from 'react';
import './App.css';
import { MovieDetail } from './components/movies/MovieDetail';
import { MovieForm } from './components/movies/MovieForm';
import { MovieList } from './components/movies/MovieList';
import { SearchBar } from './components/movies/SearchBar';
import { useMovieMutations } from './hooks/useMovieMutations';
import { useMovies } from './hooks/useMovies';
import type { MovieCreateData } from './types/movie';

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

  const {
    createMovie,
    deleteMovie,
    isSubmitting,
  } = useMovieMutations();

  useEffect(() => {
    if (!selectedMovieId && movies.length > 0) {
      setSelectedMovieId(movies[0].sk_movie_id);
    }
  }, [movies, selectedMovieId]);

  const handleCreateMovie = async (data: MovieCreateData) => {
    const createdMovie = await createMovie({
      ...data,
      titulo: data.titulo.trim(),
    });

    if (createdMovie) {
      console.log('[App] filme criado com sucesso', createdMovie);
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
          <MovieForm onSubmit={handleCreateMovie} loading={isSubmitting} />
          {moviesError && <p className="state-message error">{moviesError}</p>}
        </aside>
      </section>
    </main>
  );
}

export default App;
