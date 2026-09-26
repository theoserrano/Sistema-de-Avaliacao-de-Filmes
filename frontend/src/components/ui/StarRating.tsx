interface StarRatingProps {
  value: number;
  max?: number;
  size?: 'sm' | 'md' | 'lg';
}

export function StarRating({ value, max = 5, size = 'md' }: StarRatingProps) {
  const normalized = Math.max(0, Math.min(max, Number.isFinite(value) ? value : 0));
  const filled = Math.round(normalized);

  return (
    <span className={`star-rating star-rating--${size}`} aria-label={`Nota ${value.toFixed(1)} de ${max}`}>
      {Array.from({ length: max }, (_, index) => {
        const isFilled = index < filled;

        return (
          <span key={`${index}-${isFilled ? 'filled' : 'empty'}`} className={isFilled ? 'star star--filled' : 'star star--empty'}>
            ★
          </span>
        );
      })}
    </span>
  );
}
