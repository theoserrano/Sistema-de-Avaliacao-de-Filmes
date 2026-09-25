import { useCallback, useEffect, useState } from 'react';
import { movieService } from '../services/movieService';
import type { Movie, Review } from '../types/movie';

export function useMovieDetail(movieId: string | null) {
  const [movie, setMovie] = useState<Movie | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async (selectedId: string | null = movieId) => {
    if (!selectedId) {
      setMovie(null);
      setReviews([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const [movieData, reviewData] = await Promise.all([
        movieService.getMovieById(selectedId),
        movieService.getMovieReviews(selectedId),
      ]);

      console.log('[useMovieDetail] resposta da API', {
        selectedId,
        movieData,
        reviewData,
      });

      setMovie(movieData);
      setReviews(reviewData);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao carregar detalhes do filme';
      console.error('[useMovieDetail] falha ao buscar detalhes', {
        selectedId,
        err,
      });
      setError(message);
      setMovie(null);
      setReviews([]);
    } finally {
      setLoading(false);
    }
  }, [movieId]);

  useEffect(() => {
    void refresh(movieId);
  }, [movieId, refresh]);

  return {
    movie,
    reviews,
    loading,
    error,
    refresh,
  };
}
