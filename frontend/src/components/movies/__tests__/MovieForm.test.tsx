/// <reference types="@testing-library/jest-dom" />
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { MovieForm } from '../MovieForm';

describe('MovieForm', () => {
  it('deve renderizar os campos de Título, Ano e o botão de submissão', () => {
    const handleSubmit = vi.fn();

    render(<MovieForm onSubmit={handleSubmit} loading={false} />);

    expect(screen.getByPlaceholderText(/título do filme/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/ano/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /salvar filme/i })).toBeInTheDocument();
  });

  it('deve exibir "Atualizar Filme" quando initialData for fornecido', () => {
    const handleSubmit = vi.fn();
    const movieMock = {
      sk_movie_id: '123',
      id_filme: 'movie_123',
      titulo: 'Memories of Murder',
      ano_lancamento: 2003,
      duracao_minutos: 132,
      sinopse: 'Um filme clássico.',
      url_poster: 'http://example.com/poster.jpg',
    };

    render(<MovieForm onSubmit={handleSubmit} loading={false} initialData={movieMock} />);

    expect(screen.getByDisplayValue('Memories of Murder')).toBeInTheDocument();
    expect(screen.getByDisplayValue('2003')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /atualizar filme/i })).toBeInTheDocument();
  });
});
