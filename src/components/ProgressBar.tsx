type ProgressBarProps = {
  value: number;
};

function ProgressBar({ value }: ProgressBarProps) {
  const safeValue = Math.min(100, Math.max(0, value));

  return (
    <div className="progress-track" aria-label={`${safeValue}% complete`} role="progressbar" aria-valuenow={safeValue} aria-valuemin={0} aria-valuemax={100}>
      <span className="progress-track__fill" style={{ width: `${safeValue}%` }} />
    </div>
  );
}

export default ProgressBar;
