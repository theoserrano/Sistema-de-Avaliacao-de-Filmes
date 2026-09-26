import type { Movie } from '../../types/movie';

interface MovieMetaProps {
  movie: Movie;
}

export function MovieMeta({ movie }: MovieMetaProps) {
  const poster = movie.url_poster || 'https://placehold.co/400x600/1b252d/ffffff?text=Poster';
  const averageRating = movie.media_avaliacoes ?? 0;

  // Garante a leitura correta do elenco independente da chave retornada pela API
  const castList = movie.atores || (movie as any).elenco || (movie as any).cast || [];

  // Filtra diretores e atores da lista de pessoas, se disponível
  const directors = (movie as any).people?.filter((p: any) => p.tipo_pessoa === 'Diretor') ?? [];

  return (
    <div className="detail-header">
      <div className="detail-poster-wrap">
        <img className="detail-poster" src={poster} alt={`Poster do filme ${movie.titulo}`} />
        {movie.media_avaliacoes != null && (
          <span className="detail-score-badge">
            {movie.media_avaliacoes.toFixed(1)}/10
          </span>
        )}
      </div>

      <div className="detail-copy">
        <p className="eyebrow">{movie.id_filme}</p>
        <h2>{movie.titulo}</h2>

        <div className="meta-row">
          <span>{movie.ano_lancamento || 'Sem ano'}</span>
          <span>{movie.duracao_minutos ? `${movie.duracao_minutos} min` : 'Sem duração'}</span>
          <span>{movie.total_avaliacoes ?? 0} avaliações</span>
        </div>

        {averageRating > 0 && (
          <div className="movie-rating-row">
            <span className="movie-rating-value">{averageRating.toFixed(1)}/10</span>
          </div>
        )}

        {directors.length > 0 && (
          <p className="movie-director">
            Directed by{' '}
            {directors.map((d: any) => d.nome_pessoa).join(', ')}
          </p>
        )}

        {castList.length > 0 && (
          <div className="cast-section">
            <span className="cast-label">ELENCO</span>
            <div className="cast-pills">
              {castList.map((ator: any, index: number) => (
                <span key={index} className="cast-pill">
                  {typeof ator === 'string' ? ator : ator.nome_pessoa ?? ator.nome}
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