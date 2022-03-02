import './ProgressBar.scss';

interface ProgressBarProps {
  stepNum: number;
  totalNumSteps: number;
}
export default function ProgressBar({ stepNum, totalNumSteps }: ProgressBarProps) {
  return (
    <div className='custom-progress-bar'>
      <div
        className='progress-bar-inner'
        style={{ width: `${Math.floor(
          (Math.min(stepNum, totalNumSteps)/totalNumSteps) * 100
        )}%` }}
      >
      </div>
    </div>
  );
}
