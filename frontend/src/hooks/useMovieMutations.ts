import { useCallback, useState } from 'react';
import { movieService } from '../services/movieService';
import type { Movie, MovieCreateData, MovieUpdateData, Review, ReviewCreateData } from '../types/movie';

export function useMovieMutations() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const runMutation = useCallback(async <T>(
    action: () => Promise<T>,
    label: string,
  ): Promise<T | null> => {
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const result = await action();
      console.log(`[useMovieMutations] ${label} concluída`, result);
      return result;
    } catch (err) {
      const message = err instanceof Error ? err.message : `Erro ao executar ${label}`;
      console.error(`[useMovieMutations] ${label} falhou`, err);
      setSubmitError(message);
      return null;
    } finally {
      setIsSubmitting(false);
    }
  }, []);

  const createMovie = useCallback(
    async (data: MovieCreateData): Promise<Movie | null> =>
      runMutation(() => movieService.createMovie(data), 'createMovie'),
    [runMutation],
  );

  const updateMovie = useCallback(
    async (sk_movie_id: string, data: MovieUpdateData): Promise<Movie | null> =>
      runMutation(() => movieService.updateMovie(sk_movie_id, data), 'updateMovie'),
    [runMutation],
  );

  const deleteMovie = useCallback(
    async (sk_movie_id: string): Promise<boolean> => {
      const result = await runMutation(() => movieService.deleteMovie(sk_movie_id), 'deleteMovie');
      return result === undefined || result === null;
    },
    [runMutation],
  );

  const addReview = useCallback(
    async (sk_movie_id: string, data: ReviewCreateData): Promise<Review | null> =>
      runMutation(() => movieService.addReview(sk_movie_id, data), 'addReview'),
    [runMutation],
  );

  return {
    isSubmitting,
    submitError,
    createMovie,
    updateMovie,
    deleteMovie,
    addReview,
  };
}
