import { api } from './api';
import type { Movie, MovieCreateData, MovieUpdateData, Review, ReviewCreateData } from '../types/movie';

export const movieService = {
  // 1. Listar filmes (com busca e paginação)
  async getMovies(search = '', skip = 0, limit = 10): Promise<Movie[]> {
    const response = await api.get<Movie[]>('/movies', {
      params: { search: search || undefined, skip, limit },
    });
    return response.data;
  },

  // 2. Obter detalhes do filme por ID
  async getMovieById(sk_movie_id: string): Promise<Movie> {
    const response = await api.get<Movie>(`/movies/${sk_movie_id}`);
    return response.data;
  },

  // 3. Cadastrar filme
  async createMovie(data: MovieCreateData): Promise<Movie> {
    const response = await api.post<Movie>('/movies', data);
    return response.data;
  },

  // 4. Atualizar filme
  async updateMovie(sk_movie_id: string, data: MovieUpdateData): Promise<Movie> {
    const response = await api.patch<Movie>(`/movies/${sk_movie_id}`, data);
    return response.data;
  },

  // 5. Deletar filme
  async deleteMovie(sk_movie_id: string): Promise<void> {
    await api.delete(`/movies/${sk_movie_id}`);
  },

  // 6. Listar histórico de avaliações do filme
  async getMovieReviews(sk_movie_id: string): Promise<Review[]> {
    const response = await api.get<Review[]>(`/movies/${sk_movie_id}/reviews`);
    return response.data;
  },

  // 7. Adicionar nova avaliação
  async addReview(sk_movie_id: string, data: ReviewCreateData): Promise<Review> {
    const response = await api.post<Review>(`/movies/${sk_movie_id}/reviews`, data);
    return response.data;
  },
};