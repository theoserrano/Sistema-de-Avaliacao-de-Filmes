import { useEffect, useMemo, useState } from 'react';
import './App.css';
import logo from './assets/logo.png';
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
  const [isMovieFormOpen, setIsMovieFormOpen] = useState(false);
  const [profileTab, setProfileTab] = useState<'watched' | 'all'>('watched');

  const visibleMovies = useMemo(() => {
    if (profileTab === 'all') {
      return movies;
    }

    return movies.filter((movie) => (movie.total_avaliacoes ?? 0) > 0 || (movie.reviews?.length ?? 0) > 0);
  }, [movies, profileTab]);

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

          <nav className="topbar-nav" aria-label="Navegação principal">
            <a href="#">FILMS</a>
            <a href="#">LISTS</a>
            <a href="#">MEMBERS</a>
            <a href="#">JOURNAL</a>
          </nav>

          <div className="topbar-actions">
            <button type="button" className="ghost-button" onClick={() => refreshMovies()}>
              Atualizar
            </button>
            <button type="button" className="primary-button" onClick={() => setIsMovieFormOpen(true)}>
              Adicionar filme
            </button>
          </div>
        </div>
      </header>

      <main className="app-shell">
        <section className="profile-strip">
          <div className="profile-avatar">S</div>
          <div className="profile-info">
            <span className="profile-name">Seu perfil</span>
          </div>

          <div className="profile-tabs" aria-label="Tab de navegação do perfil">
            <button
              type="button"
              className={profileTab === 'watched' ? 'tab-button tab-active' : 'tab-button'}
              onClick={() => setProfileTab('watched')}
            >
              Assistidos
            </button>
            <button
              type="button"
              className={profileTab === 'all' ? 'tab-button tab-active' : 'tab-button'}
              onClick={() => setProfileTab('all')}
            >
              Todos
            </button>
          </div>
        </section>

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
