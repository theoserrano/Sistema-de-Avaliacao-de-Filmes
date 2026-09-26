import type { Movie } from '../../types/movie';
import { MovieListItem } from './MovieListItem';
import './MovieList.css';

interface MovieListProps {
  movies: Movie[];
  selectedMovieId: string | null;
  onSelectMovie: (movieId: string) => void;
  loading: boolean;
  error: string | null;
}

export function MovieList({
  movies,
  selectedMovieId,
  onSelectMovie,
  loading,
  error,
}: MovieListProps) {
  if (loading) {
    return <p className="state-message">Carregando catálogo...</p>;
  }

  if (error) {
    return <p className="state-message error">{error}</p>;
  }

  if (movies.length === 0) {
    return <p className="state-message">Nenhum filme encontrado.</p>;
  }

  return (
    <ul className="movie-list">
      {movies.map((movie) => (
        <li key={movie.sk_movie_id}>
          <MovieListItem
            movie={movie}
            isActive={movie.sk_movie_id === selectedMovieId}
            onSelect={onSelectMovie}
          />
        </li>
      ))}
    </ul>
  );
}
