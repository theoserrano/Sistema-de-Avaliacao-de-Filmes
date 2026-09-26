import type { Movie } from '../../types/movie';
import { StarRating } from '../ui/StarRating';

interface MovieMetaProps {
  movie: Movie;
}

export function MovieMeta({ movie }: MovieMetaProps) {
  const poster = movie.url_poster || 'https://placehold.co/400x600/1b252d/ffffff?text=Poster';
  const averageRating = movie.media_avaliacoes ?? 0;

  return (
    <div className="detail-header">
      <div className="detail-poster-wrap">
        <img className="detail-poster" src={poster} alt={`Poster do filme ${movie.titulo}`} />
        <span className="detail-score-badge">
          {movie.media_avaliacoes != null ? `${movie.media_avaliacoes.toFixed(1)} ★` : 'N/A'}
        </span>
      </div>

      <div className="detail-copy">
        <p className="eyebrow">{movie.id_filme}</p>
        <h2>{movie.titulo}</h2>

        <div className="meta-row">
          <span>{movie.ano_lancamento || 'Sem ano'}</span>
          <span>{movie.duracao_minutos ? `${movie.duracao_minutos} min` : 'Sem duração'}</span>
          <span>{movie.total_avaliacoes ?? 0} avaliações</span>
        </div>

        <div className="movie-rating-row">
          <StarRating value={averageRating} max={5} size="md" />
          <span className="movie-rating-value">{averageRating.toFixed(1)}/10</span>
        </div>

        <p className="movie-synopsis">{movie.sinopse || 'Sem sinopse disponível.'}</p>
      </div>
    </div>
  );
}
