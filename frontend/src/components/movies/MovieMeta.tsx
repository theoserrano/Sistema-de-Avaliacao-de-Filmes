import type { Movie } from '../../types/movie';

interface MovieMetaProps {
  movie: Movie;
}

export function MovieMeta({ movie }: MovieMetaProps) {
  return (
    <div className="detail-header">
      {movie.url_poster && (
        <img src={movie.url_poster} alt={`Poster do filme ${movie.titulo}`} />
      )}

      <div>
        <p className="eyebrow">{movie.id_filme}</p>
        <h2>{movie.titulo}</h2>
        <p>{movie.sinopse || 'Sem sinopse disponível.'}</p>

        <div className="meta-row">
          <span>{movie.ano_lancamento || 'Sem ano'}</span>
          <span>{movie.duracao_minutos ? `${movie.duracao_minutos} min` : 'Sem duração'}</span>
          <span>{movie.media_avaliacoes != null ? `${movie.media_avaliacoes.toFixed(1)} ★` : 'N/A ★'}</span>
          <span>{movie.total_avaliacoes ?? 0} avaliações</span>
        </div>
      </div>
    </div>
  );
}
