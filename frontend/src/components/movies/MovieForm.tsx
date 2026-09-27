import React, { useEffect, useState } from 'react';
import type { Movie, MovieCreateData } from '../../types/movie';
import './MovieForm.css';

interface MovieFormProps {
  onSubmit: (data: MovieCreateData) => Promise<void>;
  loading: boolean;
  initialData?: Movie | null;
}

export const MovieForm: React.FC<MovieFormProps> = ({ onSubmit, loading, initialData }) => {
  const [titulo, setTitulo] = useState(initialData?.titulo || '');
  const [ano, setAno] = useState<number>(initialData?.ano_lancamento ?? new Date().getFullYear());
  const [duracao, setDuracao] = useState<number>(initialData?.duracao_minutos ?? 120);
  const [sinopse, setSinopse] = useState(initialData?.sinopse || '');
  const [urlPoster, setUrlPoster] = useState(initialData?.url_poster || '');
  const [diretor, setDiretor] = useState(initialData?.diretor || '');
  const [genero, setGenero] = useState(initialData?.genero || '');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initialData) {
      setTitulo(initialData.titulo || '');
      setAno(initialData.ano_lancamento ?? new Date().getFullYear());
      setDuracao(initialData.duracao_minutos ?? 120);
      setSinopse(initialData.sinopse || '');
      setUrlPoster(initialData.url_poster || '');
      setDiretor(initialData.diretor || '');
      setGenero(initialData.genero || '');
    } else {
      setTitulo('');
      setAno(new Date().getFullYear());
      setDuracao(120);
      setSinopse('');
      setUrlPoster('');
      setDiretor('');
      setGenero('');
    }
    setError(null);
  }, [initialData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!titulo.trim()) {
      setError('O título do filme é obrigatório.');
      return;
    }

    const payload: MovieCreateData = {
      id_filme: initialData?.id_filme || `movie_${Date.now()}`,
      titulo,
      ano_lancamento: Number(ano),
      duracao_minutos: Number(duracao),
      sinopse,
      url_poster: urlPoster || undefined,
      diretor: diretor.trim() || undefined,
      genero: genero.trim() || undefined,
    };

    try {
      await onSubmit(payload);
      setError(null);
      if (!initialData) {
        setTitulo('');
        setSinopse('');
        setUrlPoster('');
        setAno(new Date().getFullYear());
        setDuracao(120);
        setDiretor('');
        setGenero('');
      }
    } catch (err: unknown) {
      const axiosStatus = (err as { response?: { status?: number } })?.response?.status;
      if (axiosStatus === 200 || axiosStatus === 204) {
        setError(null);
        return;
      }

      const responseDetail =
        typeof err === 'object' && err !== null && 'response' in err
          ? (err as { response?: { data?: { detail?: string } } }).response?.data?.detail
          : undefined;
      const errorMessage = err instanceof Error ? err.message : undefined;

      setError(
        responseDetail ||
        errorMessage ||
        (initialData ? 'Erro ao atualizar filme.' : 'Erro ao cadastrar filme.')
      );
    }
  };

  return (
    <form className="form-box" onSubmit={handleSubmit}>
      {error && <p className="state-message error">{error}</p>}

      <input
        type="text"
        placeholder="Título do filme"
        value={titulo}
        onChange={(e) => setTitulo(e.target.value)}
        disabled={loading}
        required
      />

      <div className="field-grid">
        <input
          type="number"
          placeholder="Ano"
          value={ano || ''}
          onChange={(e) => setAno(parseInt(e.target.value, 10))}
          disabled={loading}
        />
        <input
          type="number"
          placeholder="Duração (min)"
          value={duracao || ''}
          onChange={(e) => setDuracao(parseInt(e.target.value, 10))}
          disabled={loading}
        />
      </div>

      <div className="field-grid">
        <input
          type="text"
          placeholder="Diretor(a)"
          value={diretor}
          onChange={(e) => setDiretor(e.target.value)}
          disabled={loading}
        />
        <input
          type="text"
          placeholder="Gênero (ex: Drama, Ação)"
          value={genero}
          onChange={(e) => setGenero(e.target.value)}
          disabled={loading}
        />
      </div>

      <input
        type="url"
        placeholder="URL da capa/poster (opcional)"
        value={urlPoster}
        onChange={(e) => setUrlPoster(e.target.value)}
        disabled={loading}
      />

      <textarea
        placeholder="Sinopse do filme"
        rows={4}
        value={sinopse}
        onChange={(e) => setSinopse(e.target.value)}
        disabled={loading}
      />

      <button type="submit" className="primary-button" disabled={loading}>
        {loading ? 'Salvando...' : initialData ? 'Atualizar Filme' : 'Salvar Filme'}
      </button>
    </form>
  );
};
