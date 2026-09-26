import { useEffect, useState, type FormEvent } from 'react';
import type { Movie } from '../../types/movie';
import { useMovies } from '../../hooks/useMovies';

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
  const [knownMovies, setKnownMovies] = useState<Movie[]>(movies);
  const {
    movies: searchedMovies,
    loading: searchLoading,
    setSearch: setMovieApiSearch,
  } = useMovies(movieSearch);

  useEffect(() => {
    setMovieApiSearch(movieSearch);
  }, [movieSearch, setMovieApiSearch]);

  useEffect(() => {
    setKnownMovies((current) => {
      const mergedMovies = new Map(current.map((movie) => [movie.sk_movie_id, movie]));
      [...movies, ...searchedMovies].forEach((movie) => mergedMovies.set(movie.sk_movie_id, movie));
      return Array.from(mergedMovies.values());
    });
  }, [movies, searchedMovies]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(lists));
    } catch {
    }
  }, [lists]);

  const profileLists = lists.filter((list) => list.ownerProfile === profileName);
  const availableMovies = Array.from(new Map([...knownMovies, ...movies, ...searchedMovies].map((movie) => [movie.sk_movie_id, movie])).values());
  const selectedMovies = availableMovies.filter((movie) => selectedMovieIds.includes(movie.sk_movie_id));
  const movieOptions = Array.from(new Map([...searchedMovies, ...selectedMovies].map((movie) => [movie.sk_movie_id, movie])).values());

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

  const removeList = (listId: string, listTitle: string) => {
    if (!window.confirm(`Deseja realmente excluir a lista "${listTitle}"?`)) return;
    setLists((current) => current.filter((list) => list.id !== listId));
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
          {searchLoading && <p className="state-message">Buscando filmes...</p>}
          {!searchLoading && movieOptions.length === 0 && <p className="state-message">Nenhum filme encontrado.</p>}
          {movieOptions.map((movie) => (
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
            <div className="list-card-header">
              <h3>{list.title}</h3>
              <button
                type="button"
                className="danger-button list-delete-button"
                onClick={() => removeList(list.id, list.title)}
                aria-label={`Excluir lista ${list.title}`}
                title="Remover lista"
              >
                🗑
              </button>
            </div>
            {list.description && <p>{list.description}</p>}
            <ul>
              {list.movieIds.map((movieId) => {
                const movie = availableMovies.find((candidate) => candidate.sk_movie_id === movieId);
                return movie ? <li key={movieId}>{movie.titulo}</li> : null;
              })}
            </ul>
          </article>
        ))}
      </div>
    </div>
  );
}
