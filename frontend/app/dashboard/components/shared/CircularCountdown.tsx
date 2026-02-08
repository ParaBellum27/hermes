interface CircularCountdownProps {
  countdown: number;
  maxTime: number;
}

export function CircularCountdown({ countdown, maxTime }: CircularCountdownProps) {
  return (
    <div className="relative w-5 h-5">
      <svg className="transform -rotate-90 w-5 h-5">
        <circle
          cx="10"
          cy="10"
          r="8"
          stroke="currentColor"
          strokeWidth="2"
          fill="none"
          className="text-gray-200"
        />
        <circle
          cx="10"
          cy="10"
          r="8"
          stroke="currentColor"
          strokeWidth="2"
          fill="none"
          strokeDasharray={`${2 * Math.PI * 8}`}
          strokeDashoffset={`${2 * Math.PI * 8 * (1 - countdown / maxTime)}`}
          className="text-[#5578C8] transition-all duration-100"
          strokeLinecap="round"
        />
      </svg>
    </div>
  );
}
