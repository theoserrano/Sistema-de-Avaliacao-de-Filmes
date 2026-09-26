import { useState } from 'react';
import { useMovieDetail } from '../../hooks/useMovieDetail';
import { useMovieMutations } from '../../hooks/useMovieMutations';
import { ReviewForm } from '../reviews/ReviewForm';
import { ReviewList } from '../reviews/ReviewList';
import { MovieMeta } from './MovieMeta';

interface MovieDetailProps {
  profileName: string;
  selectedMovieId: string | null;
  onDeleteMovie: (movieId: string) => void;
  isMovieInWatchlist: (movieId: string) => boolean;
  onToggleWatchlist: (movieId: string) => void;
}

export function MovieDetail({
  profileName,
  selectedMovieId,
  onDeleteMovie,
  isMovieInWatchlist,
  onToggleWatchlist,
}: MovieDetailProps) {
  const { movie, reviews, loading, error, refresh } = useMovieDetail(selectedMovieId);
  const { addReview, isSubmitting } = useMovieMutations();
  const [isReviewFormOpen, setIsReviewFormOpen] = useState(false);

  const handleAddReview = async (movieId: string, data: { nome: string; nota: number; comentario: string }) => {
    const addedReview = await addReview(movieId, data);

    if (addedReview) {
      setIsReviewFormOpen(false);
      await refresh();
    }
  };

  if (!selectedMovieId) {
    return <p className="state-message">Selecione um filme no catálogo para ver os detalhes.</p>;
  }

  if (loading) {
    return <p className="state-message">Carregando detalhes do filme...</p>;
  }

  if (error) {
    return <p className="state-message error">{error}</p>;
  }

  if (!movie) {
    return <p className="state-message">Filme não encontrado.</p>;
  }

  return (
    <>
      <MovieMeta movie={movie} />

      <div className="detail-actions">
        <button
          type="button"
          className="primary-button"
          onClick={() => setIsReviewFormOpen(true)}
        >
          Adicionar Resenha
        </button>

        <button
          type="button"
          className="secondary-button"
          onClick={() => onToggleWatchlist(movie.sk_movie_id)}
        >
          {isMovieInWatchlist(movie.sk_movie_id) ? 'Remover da Watchlist' : 'Adicionar à Watchlist'}
        </button>

        <button
          type="button"
          className="danger-button"
          onClick={() => onDeleteMovie(movie.sk_movie_id)}
        >
          Remover Filme
        </button>
      </div>

      <div className="reviews-box">
        <h3>Histórico de Resenhas</h3>
        <ReviewList reviews={reviews} loading={loading} error={null} />
      </div>

      {isReviewFormOpen && (
        <div className="modal-backdrop" onClick={() => setIsReviewFormOpen(false)}>
          <div className="modal-panel modal-panel--compact" onClick={(event) => event.stopPropagation()}>
            <div className="modal-header">
              <h3>Adicionar Avaliação</h3>
              <button type="button" className="icon-button" onClick={() => setIsReviewFormOpen(false)} aria-label="Fechar modal de avaliação">
                ×
              </button>
            </div>

            <ReviewForm
              movieId={selectedMovieId}
              profileName={profileName}
              onSubmit={handleAddReview}
              loading={isSubmitting}
            />
          </div>
        </div>
      )}
    </>
  );
}
