/**
 * Retrieves the formated form of a seconds-timer.
 * A prefix `0` is added if the number is single-digit.
 * @param seconds number of seconds
 * @returns string with seconds
 */
export function formatSeconds(seconds: number): string {
	return seconds < 10 ? `0${seconds}` : `${seconds}`;
}