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

function formatDiaryDate(dateString: string) {
  const date = new Date(dateString);

  if (Number.isNaN(date.getTime())) {
    return 'Sem data';
  }

  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(date).toUpperCase();
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
        const formattedDate = formatDiaryDate(entry.review.created_at);
        const movieRating = Number(entry.review.nota ?? 0);

        return (
          <article key={`${entry.movieId}-${entry.review.sk_movie_review_id}`} className="diary-item">
            <div className="diary-date-box">
              <span className="diary-date-day">{new Date(entry.review.created_at).getDate().toString().padStart(2, '0')}</span>
              <span className="diary-date-month">
                {new Intl.DateTimeFormat('pt-BR', { month: 'short' }).format(new Date(entry.review.created_at)).toUpperCase()}
              </span>
              <span className="diary-date-year">{new Date(entry.review.created_at).getFullYear()}</span>
            </div>

            <img className="diary-poster" src={entry.poster} alt={`Poster do filme ${entry.movieTitle}`} />

            <div className="diary-content">
              <div className="diary-header-row">
                <h3>{entry.movieTitle}</h3>
                <span className="diary-year">{entry.movieYear || 'Sem ano'}</span>
              </div>

              <div className="diary-meta-row">
                <StarRating value={movieRating / 2} max={5} size="sm" />
                <span className="diary-score">{movieRating.toFixed(1)}/10</span>
              </div>

              <p className="diary-timestamp">{formattedDate}</p>
            </div>
          </article>
        );
      })}
    </div>
  );
}
