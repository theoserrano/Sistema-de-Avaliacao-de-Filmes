interface StarRatingProps {
  value: number;
  max?: number;
  size?: 'sm' | 'md' | 'lg';
}

export function StarRating({ value, max = 5, size = 'md' }: StarRatingProps) {
  const score = Math.max(0, Math.min(10, Number.isFinite(value) ? value : 0));
  const filled = Math.max(0, Math.min(5, Math.ceil(score / 2)));
  const starCount = Math.max(0, Math.min(5, max));

  return (
    <span className={`star-rating star-rating--${size}`} aria-label={`Nota ${score.toFixed(1)} de 10`}>
      {Array.from({ length: starCount }, (_, index) => {
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
