interface ProgressBarProps {
  /**
   * Current step/progress of the progress bar
   */
  stepNum: number;
  /**
   * Total number of steps in the progress bar
   */
  totalNumSteps: number;
}

/**
 * Renders a progress bar
 */
export default function ProgressBar({
  stepNum,
  totalNumSteps,
}: ProgressBarProps) {
  const width = Math.floor(
    (Math.min(stepNum, totalNumSteps) / totalNumSteps) * 100
  );

  return (
    <div className="h-8 w-full overflow-hidden rounded-full border-4 border-alu-mid-gray bg-alu-light-gray p-0">
      <div
        className="h-full rounded-full bg-gradient-to-r from-lime-600 to-lime-400"
        style={{
          width: `${width}%`,
          transition: "0.5s cubic-bezier(.21, .59, .56, 1.29)",
        }}
      ></div>
    </div>
  );
}
