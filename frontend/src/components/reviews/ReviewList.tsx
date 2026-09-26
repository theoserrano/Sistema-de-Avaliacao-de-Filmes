import type { Review } from '../../types/movie';

interface ReviewListProps {
  reviews: Review[];
  loading: boolean;
  error: string | null;
}

export function ReviewList({ reviews, loading, error }: ReviewListProps) {
  if (loading) {
    return <p className="state-message">Carregando avaliações...</p>;
  }

  if (error) {
    return <p className="state-message error">{error}</p>;
  }

  if (reviews.length === 0) {
    return <p className="state-message">Nenhuma resenha cadastrada ainda.</p>;
  }

  return (
    <ul className="review-list">
      {reviews.map((review) => (
        <li key={review.sk_movie_review_id} className="review-item">
          <div className="review-item-header">
            <strong>{review.nome}</strong>
            <span className="review-score">★ {review.nota.toFixed(1)}/10</span>
          </div>
          <p>{review.comentario}</p>
        </li>
      ))}
    </ul>
  );
}
