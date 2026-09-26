import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { MovieList } from '../MovieList';

describe('MovieList', () => {
  it('deve exibir mensagem de carregamento quando loading for true', () => {
    render(
      <MovieList
        movies={[]}
        selectedMovieId={null}
        onSelectMovie={() => {}}
        loading={true}
        error={null}
      />
    );

    expect(screen.getByText(/carregando catálogo/i)).toBeInTheDocument();
  });

  it('deve exibir mensagem quando nenhum filme for encontrado', () => {
    render(
      <MovieList
        movies={[]}
        selectedMovieId={null}
        onSelectMovie={() => {}}
        loading={false}
        error={null}
      />
    );

    expect(screen.getByText(/nenhum filme encontrado/i)).toBeInTheDocument();
  });
});