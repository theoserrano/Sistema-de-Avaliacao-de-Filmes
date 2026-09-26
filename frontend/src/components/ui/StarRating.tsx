interface StarRatingProps {
  value: number;
  max?: number;
  size?: 'sm' | 'md' | 'lg';
}

export function StarRating({ value, max = 5, size = 'md' }: StarRatingProps) {
  // Converte escala de 0-10 para 0-5
  const starsScore = (Number.isFinite(value) ? value : 0) / 2;
  const filledStars = Math.min(max, Math.max(0, Math.round(starsScore)));

  return (
    <span className={`star-rating star-rating--${size}`} aria-label={`Nota ${value.toFixed(1)} de 10`}>
      {Array.from({ length: max }, (_, index) => {
        const isFilled = index < filledStars;

        return (
          <span key={index} className={isFilled ? 'star star--filled' : 'star star--empty'}>
            ★
          </span>
        );
      })}
    </span>
  );
}