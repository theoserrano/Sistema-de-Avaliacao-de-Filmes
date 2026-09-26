import type { Review } from '../../types/movie';
import { StarRating } from './StarRating';

export interface DiaryEntry {
  movieId: string;
  movieTitle: string;
  movieYear?: number;
  poster: string;
  review: Review;
}

interface DiaryTimelineProps {
  entries: DiaryEntry[];
}

export function DiaryTimeline({ entries }: DiaryTimelineProps) {
  if (entries.length === 0) {
    return (
      <div className="empty-section">
        <p>Nenhuma avaliação no diário ainda.</p>
      </div>
    );
  }

  return (
    <div className="diary-list">
      {entries.map((entry) => {
        const movieRating = Number(entry.review.nota ?? 0);
        const reviewDate = new Date(entry.review.created_at);

        return (
          <article key={`${entry.movieId}-${entry.review.sk_movie_review_id}`} className="diary-item">
            <div className="diary-date-box">
              <span className="diary-date-day">{reviewDate.getDate().toString().padStart(2, '0')}</span>
              <span className="diary-date-month">
                {new Intl.DateTimeFormat('pt-BR', { month: 'short' }).format(reviewDate).toUpperCase()}
              </span>
              <span className="diary-date-year">{reviewDate.getFullYear()}</span>
            </div>

            <img className="diary-poster" src={entry.poster} alt={`Poster do filme ${entry.movieTitle}`} />

            <div className="diary-content">
              <div className="diary-header-row">
                <h3>{entry.movieTitle}</h3>
                <span className="diary-year">({entry.movieYear || 'N/A'})</span>
              </div>

              <div className="diary-meta-row">
                <StarRating value={movieRating / 2} max={5} size="sm" />
                <span className="diary-score">{movieRating.toFixed(1)}/10</span>
              </div>

              {entry.review.comentario && (
                <p className="diary-comment">"{entry.review.comentario}"</p>
              )}
            </div>
          </article>
        );
      })}
    </div>
  );
}