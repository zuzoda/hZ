// Will return whether the current environment is in a regular browser
// and not CEF
export const isEnvBrowser = (): boolean => !window.invokeNative;

// Basic no operation function
export const noop = (): void => {};

export function formatNumber(number: string): string {
  if (!number) return "";
  const reversed = number.split("").reverse().join("");
  const formatted = reversed.match(/.{1,3}/g)?.join(" ");
  return formatted?.split("").reverse().join("") || "";
}
