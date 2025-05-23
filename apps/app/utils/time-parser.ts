export const timeParser = (time: number) => {
  if (time < 1000) return "<1s";

  if (time >= 60000) {
    const minutes = Math.floor(time / 60000);
    const seconds = Math.floor((time % 60000) / 1000);
    return seconds === 0 ? `${minutes}mn` : `${minutes}mn ${seconds}s`;
  }

  return `${Math.floor(time / 1000)}s`;
};
