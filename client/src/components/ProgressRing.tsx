interface ProgressRingProps {
  progress: number;
  size?: number;
  strokeWidth?: number;
  color?: string;
  children?: React.ReactNode;
}

export default function ProgressRing({
  progress,
  size = 48,
  strokeWidth = 7,
  color = '#8B5CF6',
  children,
}: ProgressRingProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (progress / 100) * circumference;

  return (
    <div className="budget-ring" style={{ width: size, height: size }}>
      <svg width={size} height={size}>
        <circle
          className="budget-ring-bg"
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
        />
        <circle
          className="budget-ring-fill"
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeWidth={strokeWidth}
        />
      </svg>
      {children && (
        <div className="budget-ring-text" style={{ fontSize: size * 0.2 }}>
          {children}
        </div>
      )}
    </div>
  );
}
