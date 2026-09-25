import type { Movie } from '../../types/movie';

interface MovieListItemProps {
  movie: Movie;
  isActive: boolean;
  onSelect: (movieId: string) => void;
}

export function MovieListItem({ movie, isActive, onSelect }: MovieListItemProps) {
  return (
    <button
      type="button"
      className={isActive ? 'movie-card active' : 'movie-card'}
      onClick={() => onSelect(movie.sk_movie_id)}
    >
      <span className="movie-card-title">{movie.titulo}</span>
      <span className="movie-card-meta">
        {movie.ano_lancamento ? `${movie.ano_lancamento} • ` : ''}
        {movie.media_avaliacoes != null ? `${movie.media_avaliacoes.toFixed(1)} ★` : 'N/A ★'}
        {' '}({movie.total_avaliacoes ?? 0})
      </span>
    </button>
  );
}
