import { useEffect, useMemo, useState } from 'react';
import './App.css';
import logo from './assets/logo.png';
import { MovieDetail } from './components/movies/MovieDetail';
import { MovieForm } from './components/movies/MovieForm';
import { MovieList } from './components/movies/MovieList';
import { SearchBar } from './components/movies/SearchBar';
import { DiaryTimeline } from './components/ui/DiaryTimeline';
import { ProfileStrip, type ProfileSection } from './components/ui/ProfileStrip';
import { useMovieMutations } from './hooks/useMovieMutations';
import { useMovies } from './hooks/useMovies';
import { ListsView } from './components/profile/ListsView';
import type { Movie, MovieCreateData } from './types/movie';

interface WatchlistRecord {
  ownerProfile: string;
  movieIds: string[];
}

const WATCHLIST_STORAGE_KEY = 'theoboxd-watchlists';

function readWatchlists(): WatchlistRecord[] {
  try {
    const stored = localStorage.getItem(WATCHLIST_STORAGE_KEY);
    const parsed: unknown = stored ? JSON.parse(stored) : [];
    return Array.isArray(parsed)
      ? parsed.filter((item): item is WatchlistRecord => (
        typeof item === 'object' && item !== null &&
        typeof (item as WatchlistRecord).ownerProfile === 'string' &&
        Array.isArray((item as WatchlistRecord).movieIds) &&
        (item as WatchlistRecord).movieIds.every((movieId) => typeof movieId === 'string')
      ))
      : [];
  } catch {
    return [];
  }
}

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
  const [editingMovie, setEditingMovie] = useState<Movie | null>(null);
  const [detailVersion, setDetailVersion] = useState(0);
  const [profileSection, setProfileSection] = useState<ProfileSection>('films');
  const [profileName, setProfileName] = useState<string>(() => {
    return localStorage.getItem('theoboxd_username') || 'Usuário';
  });

  const handleProfileNameChange = (newName: string) => {
    setProfileName(newName);
    localStorage.setItem('theoboxd_username', newName);
  };

  const [historyMovies, setHistoryMovies] = useState<Movie[]>([]);
  const [watchlists, setWatchlists] = useState<WatchlistRecord[]>(readWatchlists);

  useEffect(() => {
    try {
      localStorage.setItem(WATCHLIST_STORAGE_KEY, JSON.stringify(watchlists));
    } catch {
    }
  }, [watchlists]);

  useEffect(() => {
    if (movies.length === 0) {
      return;
    }

    setHistoryMovies((previousMovies) => {
      const mergedMovies = new Map(previousMovies.map((movie) => [movie.sk_movie_id, movie]));
      let hasChanges = false;

      movies.forEach((movie) => {
        if (mergedMovies.get(movie.sk_movie_id) !== movie) {
          mergedMovies.set(movie.sk_movie_id, movie);
          hasChanges = true;
        }
      });

      return hasChanges ? Array.from(mergedMovies.values()) : previousMovies;
    });
  }, [movies]);

  const visibleMovies = movies;
  const availableMovies = useMemo(() => {
    const mergedMovies = new Map(historyMovies.map((movie) => [movie.sk_movie_id, movie]));
    movies.forEach((movie) => mergedMovies.set(movie.sk_movie_id, movie));
    return Array.from(mergedMovies.values());
  }, [historyMovies, movies]);

  const activeWatchlistIds = useMemo(
    () => watchlists.find((watchlist) => watchlist.ownerProfile === profileName)?.movieIds ?? [],
    [profileName, watchlists],
  );

  const activeWatchlistMovies = useMemo(
    () => activeWatchlistIds
      .map((movieId) => availableMovies.find((movie) => movie.sk_movie_id === movieId))
      .filter((movie): movie is Movie => Boolean(movie)),
    [activeWatchlistIds, availableMovies],
  );

  const isMovieInWatchlist = (movieId: string) => activeWatchlistIds.includes(movieId);

  const handleToggleWatchlist = (movieId: string) => {
    setWatchlists((current) => {
      const currentIds = current.find((watchlist) => watchlist.ownerProfile === profileName)?.movieIds ?? [];
      const nextIds = currentIds.includes(movieId)
        ? currentIds.filter((id) => id !== movieId)
        : [...currentIds, movieId];
      const withoutProfile = current.filter((watchlist) => watchlist.ownerProfile !== profileName);

      return nextIds.length > 0
        ? [...withoutProfile, { ownerProfile: profileName, movieIds: nextIds }]
        : withoutProfile;
    });
  };

  const userReviewEntries = useMemo(() => {
    const normalizedProfileName = profileName.trim().toLowerCase();

    return historyMovies
      .flatMap((movie) => {
        const reviews = (movie.reviews ?? []).filter(
          (review) => review.nome.trim().toLowerCase() === normalizedProfileName,
        );

        return reviews.map((review) => ({
          movieId: movie.sk_movie_id,
          movieTitle: movie.titulo,
          movieYear: movie.ano_lancamento,
          poster: movie.url_poster || 'https://placehold.co/300x450/1b252d/ffffff?text=Poster',
          review,
        }));
      })
      .sort((a, b) => new Date(b.review.created_at).getTime() - new Date(a.review.created_at).getTime());
  }, [historyMovies, profileName]);

  const {
    createMovie,
    updateMovie,
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

  const handleOpenCreateMovie = () => {
    setEditingMovie(null);
    setIsMovieFormOpen(true);
  };

  const handleEditMovie = (movieToEdit?: Movie) => {
    const targetMovie = movieToEdit || visibleMovies.find((m) => m.sk_movie_id === selectedMovieId);
    if (targetMovie) {
      setEditingMovie(targetMovie);
      setIsMovieFormOpen(true);
    }
  };

  const handleCloseMovieModal = () => {
    setIsMovieFormOpen(false);
    setEditingMovie(null);
  };

  const handleSubmitMovie = async (data: MovieCreateData) => {
    try {
      if (editingMovie) {
        const updatedMovie = await updateMovie(editingMovie.sk_movie_id, {
          titulo: data.titulo.trim(),
          ano_lancamento: data.ano_lancamento,
          duracao_minutos: data.duracao_minutos,
          sinopse: data.sinopse,
          url_poster: data.url_poster,
        });

        console.log('[App] filme atualizado com sucesso', updatedMovie);
        setIsMovieFormOpen(false);
        setEditingMovie(null);
        setDetailVersion((prev) => prev + 1);
        await refreshMovies();
      } else {
        const createdMovie = await createMovie({
          ...data,
          titulo: data.titulo.trim(),
        });

        console.log('[App] filme criado com sucesso', createdMovie);
        if (createdMovie?.sk_movie_id) {
          setSelectedMovieId(createdMovie.sk_movie_id);
        }
        setIsMovieFormOpen(false);
        setEditingMovie(null);
        await refreshMovies();
      }
    } catch (err: unknown) {
      const axiosStatus = (err as { response?: { status?: number } })?.response?.status;
      if (axiosStatus === 200 || axiosStatus === 204) {
        setIsMovieFormOpen(false);
        setEditingMovie(null);
        setDetailVersion((prev) => prev + 1);
        await refreshMovies();
        return;
      }
      console.error('[App] erro no submit de filme:', err);
      throw err;
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
          profileName={profileName}
          profileSection={profileSection}
          onSectionChange={setProfileSection}
          onProfileNameChange={handleProfileNameChange}
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
              <MovieDetail
                key={`${selectedMovieId}-${detailVersion}`}
                profileName={profileName}
                selectedMovieId={selectedMovieId}
                onDeleteMovie={handleDeleteMovie}
                onEditMovie={handleEditMovie}
                isMovieInWatchlist={isMovieInWatchlist}
                onToggleWatchlist={handleToggleWatchlist}
              />
            </section>

            <aside className="panel right-panel">
              <div className="panel-header">
                <h2>Ações</h2>
                <button type="button" className="primary-button" onClick={handleOpenCreateMovie}>
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
                {profileSection === 'watchlist' && 'Watchlist'}
                {profileSection === 'lists' && 'Listas'}
              </h2>
            </div>

            {profileSection === 'diary' ? (
              <DiaryTimeline entries={userReviewEntries} profileName={profileName} />
            ) : profileSection === 'watchlist' ? (
              activeWatchlistMovies.length === 0 ? (
                <div className="empty-section"><p>Nenhum filme salvo na Watchlist de {profileName}.</p></div>
              ) : (
                <div className="watchlist-grid">
                  {activeWatchlistMovies.map((movie) => (
                    <article key={movie.sk_movie_id} className="watchlist-card">
                      <img
                        src={movie.url_poster || 'https://placehold.co/300x450/1b252d/ffffff?text=Poster'}
                        alt={`Poster do filme ${movie.titulo}`}
                        className="watchlist-poster"
                      />
                      <div>
                        <h3>{movie.titulo}</h3>
                        {movie.ano_lancamento && <span>{movie.ano_lancamento}</span>}
                      </div>
                    </article>
                  ))}
                </div>
              )
            ) : (
              <ListsView movies={visibleMovies} profileName={profileName} />
            )}
          </section>
        )}
      </main>

      {isMovieFormOpen && (
        <div className="modal-backdrop" onClick={handleCloseMovieModal}>
          <div className="modal-panel" onClick={(event) => event.stopPropagation()}>
            <div className="modal-header">
              <h3>{editingMovie ? 'Editar Filme' : 'Cadastrar Novo Filme'}</h3>
              <button
                type="button"
                className="icon-button"
                onClick={handleCloseMovieModal}
                aria-label="Fechar modal"
              >
                ×
              </button>
            </div>

            <MovieForm
              key={editingMovie?.sk_movie_id || 'create'}
              onSubmit={handleSubmitMovie}
              loading={isSubmitting}
              initialData={editingMovie}
            />
          </div>
        </div>
      )}
    </>
  );
}

export default App;
