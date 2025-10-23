import { SpotifyAccessToken } from "./SpotifyAccessToken";

/**
 * The object structure for a spotify song.
 */
export interface SpotifyWebAPISong {
	album: {
		external_urls: {
			spotify: string;
		};
		images: {
			height: number;
			width: number;
			url: string;
		}[];
		name: string;
	};
	artists: {
		external_urls: {
			spotify: string;
		};
		name: string;
	}[];
	external_urls: {
		spotify: string;
	}
	duration_ms: number;
	name: string;
}

/**
 * Defines the shape of a response from the `/currently-playing` endpoint.
 */
export interface SpotifyWebAPICurrentlyPlayingResponse {
	is_playing: boolean;
	progress_ms: number;
	item: SpotifyWebAPISong;
}

/**
 * Defines the shape of a response from the `/recently-played` endpoint.
 */
export interface SpotifyWebAPIRecentlyPlayedResponse {
	items: [{
		track: SpotifyWebAPISong;
		played_at: string;
	}]
}

/**
 * Represents the Spotify Web API with all required endpoints.
 */
export class SpotifyWebAPI {

	/**
	 * The required token to authorize requests
	 * to the Spotify Web API.
	 */
	public accessToken: SpotifyAccessToken;

	constructor(accessToken: SpotifyAccessToken) {
		this.accessToken = accessToken;
	}

	/**
	 * Retrieves the information about the currently playing song.
	 * @returns response object containing the song
	 */
	public async requestCurrentlyPlaying(): Promise<SpotifyWebAPICurrentlyPlayingResponse | undefined> {
		try {
			const response = await fetch("https://api.spotify.com/v1/me/player/currently-playing", {
				method: 'GET',
				headers: {
					'Authorization': 'Bearer ' + this.accessToken.value,
				},
			});

			if (!response.ok || response.status === 204) {
				return undefined;
			}

			return await response.json() as SpotifyWebAPICurrentlyPlayingResponse;
		} catch {
			return undefined;
		}
	}

	/**
	 * Retrieves the most recently played song.
	 * @returns response object for the most recently played song
	 */
	public async requestRecentlyPlayed(): Promise<SpotifyWebAPIRecentlyPlayedResponse | undefined> {
		try {
			const response = await fetch("https://api.spotify.com/v1/me/player/recently-played?limit=1", {
				method: 'GET',
				headers: {
					'Authorization': 'Bearer ' + this.accessToken.value,
				},
			});

			if (!response.ok) {
				return undefined;
			}

			return await response.json() as SpotifyWebAPIRecentlyPlayedResponse;
		} catch {
			return undefined;
		}
	}

}