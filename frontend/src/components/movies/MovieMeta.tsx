import type { Movie } from '../../types/movie';
import { StarRating } from '../ui/StarRating';

interface MovieMetaProps {
  movie: Movie;
}

export function MovieMeta({ movie }: MovieMetaProps) {
  const poster = movie.url_poster || 'https://placehold.co/400x600/1b252d/ffffff?text=Poster';
  const averageRating = movie.media_avaliacoes ?? 0;

  // Garante a leitura correta do elenco independente da chave retornada pela API
  const castList = movie.atores || (movie as any).elenco || (movie as any).cast || [];

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
          {/* PASSA averageRating DIRETO sem dividir por 2, pois o StarRating já converte 0-10 para 0-5 */}
          <StarRating value={averageRating} max={5} size="md" />
          <span className="movie-rating-value">{averageRating.toFixed(1)}/10</span>
        </div>

        {castList.length > 0 && (
          <div style={{ marginTop: '14px' }}>
            <strong style={{ fontSize: '0.8rem', color: 'var(--letterboxd-green)', textTransform: 'uppercase' }}>
              Elenco:
            </strong>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '6px' }}>
              {castList.map((ator: any, index: number) => (
                <span
                  key={index}
                  style={{
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid var(--letterboxd-border)',
                    padding: '2px 8px',
                    borderRadius: '4px',
                    fontSize: '0.8rem',
                    color: 'var(--letterboxd-text)',
                  }}
                >
                  {typeof ator === 'string' ? ator : ator.nome}
                </span>
              ))}
            </div>
          </div>
        )}

        <p className="movie-synopsis">{movie.sinopse || 'Sem sinopse disponível.'}</p>
      </div>
    </div>
  );
}