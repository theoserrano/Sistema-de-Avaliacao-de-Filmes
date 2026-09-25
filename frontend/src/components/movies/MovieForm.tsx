import React, { useState } from 'react';
import type { MovieCreateData } from '../../types/movie';

interface MovieFormProps {
  onSubmit: (data: MovieCreateData) => Promise<void>;
  loading: boolean;
}

export const MovieForm: React.FC<MovieFormProps> = ({ onSubmit, loading }) => {
  const [titulo, setTitulo] = useState('');
  const [ano, setAno] = useState<number>(new Date().getFullYear());
  const [duracao, setDuracao] = useState<number>(120);
  const [sinopse, setSinopse] = useState('');
  const [urlPoster, setUrlPoster] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!titulo.trim()) {
      setError('O título do filme é obrigatório.');
      return;
    }

    const payload: MovieCreateData = {
      id_filme: `movie_${Date.now()}`,
      titulo,
      ano_lancamento: Number(ano),
      duracao_minutos: Number(duracao),
      sinopse,
      url_poster: urlPoster || undefined,
    };

    try {
      await onSubmit(payload);
      setTitulo('');
      setSinopse('');
      setUrlPoster('');
      setAno(new Date().getFullYear());
      setDuracao(120);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Erro ao cadastrar filme.');
    }
  };

  return (
    <form className="form-box" onSubmit={handleSubmit}>
      <h2>Cadastrar Novo Filme</h2>
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
          value={ano}
          onChange={(e) => setAno(parseInt(e.target.value, 10))}
          disabled={loading}
        />
        <input
          type="number"
          placeholder="Duração (min)"
          value={duracao}
          onChange={(e) => setDuracao(parseInt(e.target.value, 10))}
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
        {loading ? 'Salvando...' : 'Salvar Filme'}
      </button>
    </form>
  );
};
