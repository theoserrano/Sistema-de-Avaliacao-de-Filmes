import React, { useState } from 'react';
import type { ReviewCreateData } from '../../types/movie';

interface ReviewFormProps {
  movieId: string;
  profileName: string;
  onSubmit: (movieId: string, data: ReviewCreateData) => Promise<void>;
  loading: boolean;
}

export const ReviewForm: React.FC<ReviewFormProps> = ({ movieId, profileName, onSubmit, loading }) => {
  const [nota, setNota] = useState<string>('10');
  const [comentario, setComentario] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const numericNota = parseFloat(nota);

    if (!profileName.trim() || !comentario.trim() || isNaN(numericNota)) {
      setError('Por favor, preencha todos os campos corretamente.');
      return;
    }

    if (numericNota < 0 || numericNota > 10) {
      setError('A nota deve estar entre 0 e 10.');
      return;
    }

    try {
      await onSubmit(movieId, { nome: profileName, nota: numericNota, comentario });
      setNota('10');
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
          value={profileName}
          readOnly
          disabled
          required
        />
        <input
          type="number"
          min="0"
          max="10"
          step="any"
          placeholder="Nota (0 a 10, ex: 8.5)"
          value={nota}
          onChange={(e) => setNota(e.target.value)}
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
