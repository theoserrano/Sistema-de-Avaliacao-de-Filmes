import { useEffect, useMemo, useState } from 'react';
import './App.css';
import logo from './assets/logo.png';
import { MovieDetail } from './components/movies/MovieDetail';
import { MovieForm } from './components/movies/MovieForm';
import { MovieList } from './components/movies/MovieList';
import { SearchBar } from './components/movies/SearchBar';
import { DiaryTimeline } from './components/ui/DiaryTimeline';
import { ProfileStrip, type FilmFilter, type ProfileSection } from './components/ui/ProfileStrip';
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
  const [isMovieFormOpen, setIsMovieFormOpen] = useState(false);
  const [profileSection, setProfileSection] = useState<ProfileSection>('films');
  const [filmFilter, setFilmFilter] = useState<FilmFilter>('watched');

  const visibleMovies = useMemo(() => {
    if (profileSection !== 'films') {
      return movies;
    }

    if (filmFilter === 'all') {
      return movies;
    }

    return movies.filter((movie) => (movie.total_avaliacoes ?? 0) > 0 || (movie.reviews?.length ?? 0) > 0);
  }, [movies, profileSection, filmFilter]);

  const diaryEntries = useMemo(() => {
    return movies
      .flatMap((movie) => {
        const reviews = movie.reviews ?? [];

        return reviews.map((review) => ({
          movieId: movie.sk_movie_id,
          movieTitle: movie.titulo,
          movieYear: movie.ano_lancamento,
          poster: movie.url_poster || 'https://placehold.co/300x450/1b252d/ffffff?text=Poster',
          review,
        }));
      })
      .sort((a, b) => new Date(b.review.created_at).getTime() - new Date(a.review.created_at).getTime());
  }, [movies]);

  const {
    createMovie,
    deleteMovie,
    isSubmitting,
  } = useMovieMutations();

  useEffect(() => {
    if (!selectedMovieId && visibleMovies.length > 0) {
      setSelectedMovieId(visibleMovies[0].sk_movie_id);
      return;
    }

    if (selectedMovieId && !visibleMovies.some((movie) => movie.sk_movie_id === selectedMovieId)) {
      setSelectedMovieId(visibleMovies[0]?.sk_movie_id ?? null);
    }
  }, [selectedMovieId, visibleMovies]);

  const handleCreateMovie = async (data: MovieCreateData) => {
    const createdMovie = await createMovie({
      ...data,
      titulo: data.titulo.trim(),
    });

    if (createdMovie) {
      console.log('[App] filme criado com sucesso', createdMovie);
      setSelectedMovieId(createdMovie.sk_movie_id);
      setIsMovieFormOpen(false);
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
          <div className="brand" aria-label="Theoboxd brand">
            <img className="brand-logo" src={logo} alt="Logo Theoboxd" />
            <span className="brand-name">theoboxd</span>
          </div>
        </div>
      </header>

      <main className="app-shell">
        <ProfileStrip
          profileSection={profileSection}
          filmFilter={filmFilter}
          onSectionChange={setProfileSection}
          onFilmFilterChange={setFilmFilter}
        />

        {profileSection === 'films' ? (
          <section className="panel-grid">
            <aside className="panel left-panel">
              <div className="panel-header">
                <h2>Catálogo</h2>
                <SearchBar value={search} onChange={setSearch} />
              </div>

              <MovieList
                movies={visibleMovies}
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
              <div className="panel-header">
                <h2>Ações</h2>
                <button type="button" className="primary-button" onClick={() => setIsMovieFormOpen(true)}>
                  Cadastrar filme
                </button>
              </div>

              <p className="panel-helper">
                Crie um novo título em uma tela separada para manter o catálogo sempre organizado.
              </p>

              {moviesError && <p className="state-message error">{moviesError}</p>}
            </aside>
          </section>
        ) : (
          <section className="panel full-panel">
            <div className="panel-header">
              <h2>
                {profileSection === 'diary' && 'Diário'}
                {profileSection === 'reviews' && 'Resenhas'}
                {profileSection === 'lists' && 'Listas'}
              </h2>
            </div>

            {profileSection === 'diary' ? (
              <DiaryTimeline entries={diaryEntries} />
            ) : profileSection === 'reviews' ? (
              <div className="empty-section">
                <p>As resenhas do usuário aparecerão aqui.</p>
              </div>
            ) : (
              <div className="empty-section">
                <p>As listas criadas pelo usuário aparecerão aqui.</p>
              </div>
            )}
          </section>
        )}
      </main>

      {isMovieFormOpen && (
        <div className="modal-backdrop" onClick={() => setIsMovieFormOpen(false)}>
          <div className="modal-panel" onClick={(event) => event.stopPropagation()}>
            <div className="modal-header">
              <h3>Cadastrar Novo Filme</h3>
              <button type="button" className="icon-button" onClick={() => setIsMovieFormOpen(false)} aria-label="Fechar modal">
                ×
              </button>
            </div>

            <MovieForm onSubmit={handleCreateMovie} loading={isSubmitting} />
          </div>
        </div>
      )}
    </>
  );
}

export default App;
