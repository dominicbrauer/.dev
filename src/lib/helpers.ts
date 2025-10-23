/**
 * Retrieves the formated form of a seconds-timer.
 * A prefix `0` is added if the number is single-digit.
 * @param seconds number of seconds
 * @returns string with seconds
 */
export function formatSeconds(seconds: number): string {
	return seconds < 10 ? `0${seconds}` : `${seconds}`;
}

/**
 * Retrieves the maximum rounded time of a UTC datetime in its formated text version (examples below).
 * @param datetime time in milliseconds
 * @returns the given datetime as text (e.g. '34 minutes', '16 hours', 5 days, 2 weeks)
 */
export function getFormatedTime(datetime: number): string {
	const s = 1000;
	const m = s * 60;
	const h = m * 60;
	const d = h * 24;

	let value = Math.floor(datetime / s);
	if (value >= 60) {
		value = Math.floor(datetime / m);
		if (value >= 60) {
			value = Math.floor(datetime / h);
			if (value >= 24) {
				value = Math.floor(datetime / d);
				if (value >= 7) {
					value = Math.floor(value / 7);
					return value > 1 ? value + " weeks" : value + " week";
				} else {
					return value > 1 ? value + " days" : value + " day";
				}
			} else {
				return value > 1 ? value + " hours" : value + " hour";
			}
		} else {
			return value > 1 ? value + " minutes" : value + " minute";
		}
	}
	return value > 1 ? value + " seconds" : value + " second";
}