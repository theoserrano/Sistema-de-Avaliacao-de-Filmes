import type { Movie } from '../../types/movie';

interface MovieListItemProps {
  movie: Movie;
  isActive: boolean;
  onSelect: (movieId: string) => void;
}

export function MovieListItem({ movie, isActive, onSelect }: MovieListItemProps) {
  const poster = movie.url_poster || 'https://placehold.co/300x450/1b252d/ffffff?text=Poster';
  const ratingValue = movie.media_avaliacoes != null ? movie.media_avaliacoes.toFixed(1) : 'N/A';

  return (
    <button
      type="button"
      className={isActive ? 'movie-card active' : 'movie-card'}
      onClick={() => onSelect(movie.sk_movie_id)}
    >
      <div className="movie-card-poster-wrap">
        <img className="movie-card-poster" src={poster} alt={`Poster do filme ${movie.titulo}`} />
        <span className="movie-card-score">{ratingValue}</span>
      </div>

      <div className="movie-card-body">
        <span className="movie-card-title">{movie.titulo}</span>
        <span className="movie-card-meta">
          {movie.ano_lancamento ? `${movie.ano_lancamento} • ` : ''}
          {movie.total_avaliacoes ?? 0} avaliações
        </span>
      </div>
    </button>
  );
}
