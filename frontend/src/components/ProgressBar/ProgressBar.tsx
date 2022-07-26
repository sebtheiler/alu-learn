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
    <div className="w-full h-8 p-0 border-4 border-alu-mid-gray rounded-full bg-alu-light-gray overflow-hidden">
      <div
        className="bg-gradient-to-r from-lime-600 to-lime-400 h-full rounded-full"
        style={{
          width: `${width}%`,
          transition: "0.5s cubic-bezier(.21, .59, .56, 1.29)",
        }}
      ></div>
    </div>
  );
}
