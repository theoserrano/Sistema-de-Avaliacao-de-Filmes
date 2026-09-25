import { useEffect, useState, type FormEvent } from 'react';
import './App.css';
import { MovieList } from './components/movies/MovieList';
import { SearchBar } from './components/movies/SearchBar';
import { useMovieDetail } from './hooks/useMovieDetail';
import { useMovieMutations } from './hooks/useMovieMutations';
import { useMovies } from './hooks/useMovies';
import type { MovieCreateData, ReviewCreateData } from './types/movie';

const createMovieDraft = (): MovieCreateData => ({
  id_filme: `movie_${Date.now()}`,
  titulo: '',
  data_lancamento: '2025-01-01',
  ano_lancamento: new Date().getFullYear(),
  duracao_minutos: 120,
  sinopse: 'Filme de teste criado para validação de integração com o backend.',
  url_poster: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=800&q=80',
});

const defaultReviewForm: ReviewCreateData = {
  nome: '',
  nota: 8,
  comentario: '',
};

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
  const [reviewForm, setReviewForm] = useState<ReviewCreateData>(defaultReviewForm);

  const {
    movie,
    reviews,
    loading: loadingDetail,
    error: detailError,
    refresh: refreshDetail,
  } = useMovieDetail(selectedMovieId);

  const {
    createMovie,
    updateMovie,
    deleteMovie,
    addReview,
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

  const handleAddReview = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!selectedMovieId) {
      return;
    }

    const addedReview = await addReview(selectedMovieId, {
      ...reviewForm,
      nome: reviewForm.nome.trim(),
      comentario: reviewForm.comentario.trim(),
    });

    if (addedReview) {
      setReviewForm(defaultReviewForm);
      await refreshDetail(selectedMovieId);
      await refreshMovies();
    }
  };

  const handleUpdateMovie = async () => {
    if (!selectedMovieId || !movie) {
      return;
    }

    const updatedMovie = await updateMovie(selectedMovieId, {
      titulo: `${movie.titulo} (atualizado em teste)`,
    });

    if (updatedMovie) {
      await refreshDetail(selectedMovieId);
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
          {loadingDetail ? (
            <p className="state-message">Carregando detalhes do filme...</p>
          ) : detailError ? (
            <p className="state-message error">{detailError}</p>
          ) : movie ? (
            <>
              <div className="detail-header">
                <img src={movie.url_poster || 'https://placehold.co/400x600?text=Poster'} alt={movie.titulo} />
                <div>
                  <p className="eyebrow">{movie.id_filme}</p>
                  <h2>{movie.titulo}</h2>
                  <p>{movie.sinopse || 'Sem sinopse disponível.'}</p>
                  <div className="meta-row">
                    <span>{movie.ano_lancamento || 'Sem ano'}</span>
                    <span>{movie.duracao_minutos ? `${movie.duracao_minutos} min` : 'Sem duração'}</span>
                    <span>{movie.media_avaliacoes ?? 0} ★</span>
                  </div>
                  <div className="detail-actions">
                    <button type="button" className="primary-button" onClick={handleUpdateMovie} disabled={isSubmitting}>
                      Atualizar registro
                    </button>
                    <button
                      type="button"
                      className="danger-button"
                      onClick={() => handleDeleteMovie(movie.sk_movie_id)}
                      disabled={isSubmitting}
                    >
                      Excluir filme
                    </button>
                  </div>
                </div>
              </div>

              <div className="reviews-box">
                <h3>Reviews</h3>
                {reviews.length === 0 ? (
                  <p className="state-message">Nenhuma avaliação encontrada para este filme.</p>
                ) : (
                  <ul className="review-list">
                    {reviews.map((review) => (
                      <li key={review.sk_movie_review_id}>
                        <strong>{review.nome}</strong>
                        <span>{review.nota} / 10</span>
                        <p>{review.comentario}</p>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <form className="form-box" onSubmit={handleAddReview}>
                <h3>Adicionar review</h3>
                <div className="field-grid">
                  <input
                    type="text"
                    placeholder="Seu nome"
                    value={reviewForm.nome}
                    onChange={(event) => setReviewForm((current) => ({ ...current, nome: event.target.value }))}
                  />
                  <input
                    type="number"
                    min={0}
                    max={10}
                    step={0.5}
                    value={reviewForm.nota}
                    onChange={(event) => setReviewForm((current) => ({ ...current, nota: Number(event.target.value) }))}
                  />
                </div>
                <textarea
                  rows={4}
                  placeholder="Escreva sua avaliação"
                  value={reviewForm.comentario}
                  onChange={(event) => setReviewForm((current) => ({ ...current, comentario: event.target.value }))}
                />
                <button type="submit" className="primary-button" disabled={isSubmitting}>
                  {isSubmitting ? 'Enviando...' : 'Salvar review'}
                </button>
              </form>
            </>
          ) : (
            <p className="state-message">Selecione um filme para ver os detalhes.</p>
          )}
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
          {(moviesError || detailError) && <p className="state-message error">{moviesError || detailError}</p>}
        </aside>
      </section>
    </main>
  );
}

export default App;
