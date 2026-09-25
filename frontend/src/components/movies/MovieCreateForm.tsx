import type { Dispatch, FormEvent, SetStateAction } from 'react';
import type { MovieCreateData } from '../../types/movie';

interface MovieCreateFormProps {
  value: MovieCreateData;
  isSubmitting: boolean;
  submitError: string | null;
  onSubmit: (event: FormEvent<HTMLFormElement>) => Promise<void> | void;
  onChange: Dispatch<SetStateAction<MovieCreateData>>;
}

export function MovieCreateForm({
  value,
  isSubmitting,
  submitError,
  onSubmit,
  onChange,
}: MovieCreateFormProps) {
  return (
    <>
      <form className="form-box" onSubmit={onSubmit}>
        <input
          type="text"
          placeholder="Título"
          value={value.titulo}
          onChange={(event) =>
            onChange((current) => ({ ...current, titulo: event.target.value }))
          }
        />
        <input
          type="text"
          placeholder="ID do filme"
          value={value.id_filme}
          onChange={(event) =>
            onChange((current) => ({ ...current, id_filme: event.target.value }))
          }
        />
        <input
          type="text"
          placeholder="URL do poster"
          value={value.url_poster || ''}
          onChange={(event) =>
            onChange((current) => ({ ...current, url_poster: event.target.value }))
          }
        />
        <input
          type="number"
          placeholder="Ano"
          value={value.ano_lancamento ?? ''}
          onChange={(event) =>
            onChange((current) => ({
              ...current,
              ano_lancamento: Number(event.target.value),
            }))
          }
        />
        <textarea
          rows={3}
          placeholder="Sinopse"
          value={value.sinopse || ''}
          onChange={(event) =>
            onChange((current) => ({ ...current, sinopse: event.target.value }))
          }
        />
        <button type="submit" className="primary-button" disabled={isSubmitting}>
          {isSubmitting ? 'Enviando...' : 'Criar filme'}
        </button>
      </form>

      {submitError && <p className="state-message error">{submitError}</p>}
    </>
  );
}
