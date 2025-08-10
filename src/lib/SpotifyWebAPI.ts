import { SpotifyAccessToken } from "./SpotifyAccessToken";

/**
 * Defines the shape of a response from
 * the `/currently-playing` endpoint.
 */
export interface SpotifyWebAPICurrentlyPlayingResponse {
	is_playing: boolean;
	progress_ms: number;
	item: {
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
		duration_ms: number;
		name: string;
	};
}

/**
 * Represents the API from Spotify with all
 * required endpoints.
 */
export class SpotifyWebAPI {

	/**
	 * The required token to authorize requests
	 * to the Spotify Web API.
	 */
	private accessToken: SpotifyAccessToken;

	constructor() {
		this.accessToken = new SpotifyAccessToken();
	}

	/**
	 * Retrieves the information about the currently playing song.
	 * @returns response containing the song.
	 */
	public async requestCurrentlyPlaying(): Promise<SpotifyWebAPICurrentlyPlayingResponse | undefined> {
		try {
			const response = await fetch("https://api.spotify.com/v1/me/player/currently-playing", {
				method: 'GET',
				headers: {
					'Authorization': 'Bearer ' + await this.accessToken.getValue(),
				},
			});

			if (!response.ok) {
				return undefined;
			}

			if (response.status === 204) {
				return undefined;
			}

			return await response.json() as SpotifyWebAPICurrentlyPlayingResponse;
		} catch {
			throw new WebTransportError("Could not reach the Spotify Web API endpoint.");
		}
	}

}