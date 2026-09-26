import { useEffect, useState, type FormEvent } from 'react';
import type { Movie } from '../../types/movie';

interface MovieListRecord {
  id: string;
  title: string;
  description: string;
  ownerProfile: string;
  movieIds: string[];
}

interface ListsViewProps {
  movies: Movie[];
  profileName: string;
}

const STORAGE_KEY = 'theoboxd-movie-lists';

function readLists(): MovieListRecord[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    const parsed: unknown = stored ? JSON.parse(stored) : [];
    return Array.isArray(parsed)
      ? parsed.filter((item): item is MovieListRecord => (
        typeof item === 'object' && item !== null &&
        typeof (item as MovieListRecord).id === 'string' &&
        typeof (item as MovieListRecord).title === 'string' &&
        typeof (item as MovieListRecord).ownerProfile === 'string' &&
        Array.isArray((item as MovieListRecord).movieIds)
      ))
      : [];
  } catch {
    return [];
  }
}

export function ListsView({ movies, profileName }: ListsViewProps) {
  const [lists, setLists] = useState<MovieListRecord[]>(readLists);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [movieSearch, setMovieSearch] = useState('');
  const [selectedMovieIds, setSelectedMovieIds] = useState<string[]>([]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(lists));
    } catch {
    }
  }, [lists]);

  const profileLists = lists.filter((list) => list.ownerProfile === profileName);
  const filteredMovies = movies.filter((movie) => movie.titulo.toLowerCase().includes(movieSearch.trim().toLowerCase()));

  const toggleMovie = (movieId: string) => {
    setSelectedMovieIds((current) => current.includes(movieId)
      ? current.filter((id) => id !== movieId)
      : [...current, movieId]);
  };

  const createList = (event: FormEvent) => {
    event.preventDefault();
    const trimmedTitle = title.trim();
    if (!trimmedTitle || selectedMovieIds.length === 0) return;

    setLists((current) => [...current, {
      id: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}`,
      title: trimmedTitle,
      description: description.trim(),
      ownerProfile: profileName,
      movieIds: selectedMovieIds,
    }]);
    setTitle('');
    setDescription('');
    setSelectedMovieIds([]);
  };

  return (
    <div className="lists-layout">
      <form className="list-form" onSubmit={createList}>
        <h3>Nova lista</h3>
        <input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Título da lista" required />
        <textarea value={description} onChange={(event) => setDescription(event.target.value)} placeholder="Descrição (opcional)" rows={3} />
        <fieldset className="movie-picker">
          <legend>Filmes do catálogo</legend>
          <input
            value={movieSearch}
            onChange={(event) => setMovieSearch(event.target.value)}
            placeholder="Buscar filmes para a lista..."
            aria-label="Buscar filmes para a lista"
          />
          {filteredMovies.map((movie) => (
            <label key={movie.sk_movie_id} className="movie-picker-option">
              <input type="checkbox" checked={selectedMovieIds.includes(movie.sk_movie_id)} onChange={() => toggleMovie(movie.sk_movie_id)} />
              <span>{movie.titulo}</span>
            </label>
          ))}
        </fieldset>
        <button type="submit" className="primary-button" disabled={!title.trim() || selectedMovieIds.length === 0}>Criar lista</button>
      </form>

      <div className="lists-grid">
        {profileLists.length === 0 ? <div className="empty-section"><p>Nenhuma lista criada por {profileName}.</p></div> : profileLists.map((list) => (
          <article key={list.id} className="list-card">
            <h3>{list.title}</h3>
            {list.description && <p>{list.description}</p>}
            <ul>
              {list.movieIds.map((movieId) => {
                const movie = movies.find((candidate) => candidate.sk_movie_id === movieId);
                return movie ? <li key={movieId}>{movie.titulo}</li> : null;
              })}
            </ul>
          </article>
        ))}
      </div>
    </div>
  );
}
