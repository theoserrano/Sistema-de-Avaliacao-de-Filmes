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
    <>
      <header className="topbar-shell">
        <div className="topbar-inner">
          <div className="brand" aria-label="Letterboxd style brand">
            <span className="brand-mark brand-mark--1" />
            <span className="brand-mark brand-mark--2" />
            <span className="brand-mark brand-mark--3" />
            <span className="brand-name">Letterboxd</span>
          </div>

          <nav className="topbar-nav" aria-label="Navegação principal">
            <a href="#">FILMS</a>
            <a href="#">LISTS</a>
            <a href="#">MEMBERS</a>
            <a href="#">JOURNAL</a>
          </nav>

          <button type="button" className="ghost-button" onClick={() => refreshMovies()}>
            Atualizar
          </button>
        </div>
      </header>

      <main className="app-shell">
        <section className="profile-strip">
          <div className="profile-avatar">A</div>
          <div className="profile-info">
            <span className="profile-name">Arthur Tuoto</span>
            <span className="profile-badge">PATRON</span>
          </div>
          <div className="profile-tabs" aria-label="Tab de navegação do perfil">
            <span>Activity</span>
            <span>Films</span>
            <span>Diary</span>
            <span>Reviews</span>
            <span className="tab-active">Lists</span>
            <span>Likes</span>
            <span>Network</span>
            <span>Stats</span>
          </div>
        </section>

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
    </>
  );
}

export default App;
