import { useMovieDetail } from '../../hooks/useMovieDetail';
import { useMovieMutations } from '../../hooks/useMovieMutations';
import { ReviewForm } from '../reviews/ReviewForm';
import { ReviewList } from '../reviews/ReviewList';
import { MovieMeta } from './MovieMeta';

interface MovieDetailProps {
  selectedMovieId: string | null;
  onDeleteMovie: (movieId: string) => void;
}

export function MovieDetail({ selectedMovieId, onDeleteMovie }: MovieDetailProps) {
  const { movie, reviews, loading, error, refresh } = useMovieDetail(selectedMovieId);
  const { addReview, isSubmitting } = useMovieMutations();

  const handleAddReview = async (movieId: string, data: { nome: string; nota: number; comentario: string }) => {
    const addedReview = await addReview(movieId, data);

    if (addedReview) {
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

      <ReviewForm
        movieId={selectedMovieId}
        onSubmit={handleAddReview}
        loading={isSubmitting}
      />
    </>
  );
}
