import React, { useState } from 'react';
import type { ReviewCreateData } from '../../types/movie';

interface ReviewFormProps {
  movieId: string;
  onSubmit: (movieId: string, data: ReviewCreateData) => Promise<void>;
  loading: boolean;
}

export const ReviewForm: React.FC<ReviewFormProps> = ({ movieId, onSubmit, loading }) => {
  const [nome, setNome] = useState('');
  const [nota, setNota] = useState<number>(10);
  const [comentario, setComentario] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!nome.trim() || !comentario.trim()) {
      setError('Por favor, preencha todos os campos.');
      return;
    }

    try {
      await onSubmit(movieId, { nome, nota, comentario });
      setNome('');
      setNota(10);
      setComentario('');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Erro ao enviar avaliação.');
    }
  };

  return (
    <form className="form-box" onSubmit={handleSubmit}>
      <h3>Adicionar Avaliação</h3>
      {error && <p className="state-message error">{error}</p>}

      <div className="field-grid">
        <input
          type="text"
          placeholder="Seu nome"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          disabled={loading}
          required
        />
        <input
          type="number"
          min="0"
          max="10"
          step="0.5"
          placeholder="Nota (0-10)"
          value={nota}
          onChange={(e) => setNota(parseFloat(e.target.value))}
          disabled={loading}
          required
        />
      </div>

      <textarea
        placeholder="Escreva sua resenha..."
        rows={3}
        value={comentario}
        onChange={(e) => setComentario(e.target.value)}
        disabled={loading}
        required
      />

      <button type="submit" className="primary-button" disabled={loading}>
        {loading ? 'Enviando...' : 'Publicar Resenha'}
      </button>
    </form>
  );
};
