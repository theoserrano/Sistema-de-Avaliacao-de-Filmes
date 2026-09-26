import React from 'react';
import type { Review } from '../../types/movie';


export interface UserReviewEntry {
  movieId: string;
  movieTitle: string;
  movieYear?: number;
  poster: string;
  review: Review;
}

interface UserReviewsViewProps {
  entries: UserReviewEntry[];
  profileName: string;
}

export const UserReviewsView: React.FC<UserReviewsViewProps> = ({ entries, profileName }) => {
  if (entries.length === 0) {
    return (
      <div className="empty-section">
        <p>Nenhuma resenha cadastrada por {profileName} até o momento.</p>
      </div>
    );
  }

  return (
    <div className="user-reviews-grid">
      {entries.map((entry) => {
        const movieRating = Number(entry.review.nota ?? 0);
        const formattedDate = new Intl.DateTimeFormat('pt-BR', {
          day: '2-digit',
          month: 'long',
          year: 'numeric',
        }).format(new Date(entry.review.created_at));

        return (
          <article key={entry.review.sk_movie_review_id} className="user-review-card">
            <img
              src={entry.poster}
              alt={`Poster do filme ${entry.movieTitle}`}
              className="user-review-poster"
            />
            <div className="user-review-body">
              <div className="user-review-header">
                <h3>{entry.movieTitle}</h3>
                {entry.movieYear && <span className="user-review-year">({entry.movieYear})</span>}
              </div>

              <div className="user-review-meta">
                <span className="user-review-score">{movieRating.toFixed(1)}/10</span>
                <span className="user-review-date">• {formattedDate}</span>
              </div>

              <p className="user-review-comment">{entry.review.comentario}</p>
              <span className="user-review-author">Por: {entry.review.nome}</span>
            </div>
          </article>
        );
      })}
    </div>
  );
};