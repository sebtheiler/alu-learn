function formatTime(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = seconds % 60;

  const parts: string[] = [];

  if (hours > 0 || minutes > 60) {
    parts.push(hours.toString());
  }

  parts.push(minutes.toString().padStart(2, "0"));
  parts.push(remainingSeconds.toString().padStart(2, "0"));

  return parts.join(":");
}

export function formatStartDurationTime({
  start,
  duration,
}: {
  start: number;
  duration: number;
}): string {
  return `${formatTime(start)} - ${formatTime(start + duration)}`;
}

export default formatTime;
