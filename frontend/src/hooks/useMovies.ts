import { useCallback, useEffect, useState } from 'react';
import { movieService } from '../services/movieService';
import type { Movie } from '../types/movie';

export function useMovies(initialSearch = '') {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [search, setSearch] = useState(initialSearch);
  const [skip, setSkip] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadMovies = useCallback(
    async (nextSearch = search, nextSkip = 0, append = false) => {
      setLoading(true);
      setError(null);

      try {
        const data = await movieService.getMovies(nextSearch, nextSkip, 10);
        console.log('[useMovies] resposta da API', {
          nextSearch,
          nextSkip,
          append,
          data,
        });

        setMovies((current) => (append ? [...current, ...data] : data));
        setHasMore(data.length === 10);
        return data;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Erro ao carregar filmes';
        console.error('[useMovies] falha ao buscar filmes', {
          nextSearch,
          nextSkip,
          err,
        });
        setError(message);

        if (!append) {
          setMovies([]);
        }

        return [];
      } finally {
        setLoading(false);
      }
    },
    [search],
  );

  useEffect(() => {
    void loadMovies(search, 0, false);
    setSkip(0);
  }, [loadMovies, search]);

  const refresh = useCallback(async () => {
    await loadMovies(search, 0, false);
  }, [loadMovies, search]);

  const loadMore = useCallback(async () => {
    if (loading) {
      return;
    }

    const nextSkip = skip + 10;
    setSkip(nextSkip);
    await loadMovies(search, nextSkip, true);
  }, [loading, loadMovies, search, skip]);

  return {
    movies,
    search,
    setSearch,
    loading,
    error,
    hasMore,
    refresh,
    loadMore,
  };
}
