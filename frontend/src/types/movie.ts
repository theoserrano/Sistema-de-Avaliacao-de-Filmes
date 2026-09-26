// frontend/src/types/movie.ts

export interface Review {
  sk_movie_review_id: string;
  sk_movie_id: string;
  nome: string;
  nota: number;
  comentario: string;
  created_at: string;
}

export interface ReviewCreateData {
  nome: string;
  nota: number;
  comentario: string;
}

export interface Movie {
  sk_movie_id: string;
  id_filme: string;
  titulo: string;
  data_lancamento?: string;
  ano_lancamento?: number;
  duracao_minutos?: number;
  sinopse?: string;
  url_poster?: string;
  media_avaliacoes?: number;
  total_avaliacoes?: number;
  reviews?: Review[];
  atores?: any[];
}

export interface MovieCreateData {
  id_filme: string;
  titulo: string;
  data_lancamento?: string;
  ano_lancamento?: number;
  duracao_minutos?: number;
  sinopse?: string;
  url_poster?: string;
}

export type MovieUpdateData = Partial<MovieCreateData>;