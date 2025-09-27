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
		external_urls: {
			spotify: string;
		}
		duration_ms: number;
		name: string;
	};
}

/**
 * Represents the Spotify Web API
 * with all required endpoints.
 */
export class SpotifyWebAPI {

	/**
	 * The required token to authorize requests
	 * to the Spotify Web API.
	 */
	public accessToken: SpotifyAccessToken;

	constructor(tokenValue: string) {
		this.accessToken = new SpotifyAccessToken(tokenValue);
	}

	/**
	 * Retrieves the information about the currently playing song.
	 * @returns response containing the song
	 */
	public async requestCurrentlyPlaying(): Promise<SpotifyWebAPICurrentlyPlayingResponse | undefined> {
		try {
			const response = await fetch("https://api.spotify.com/v1/me/player/currently-playing", {
				method: 'GET',
				headers: {
					'Authorization': 'Bearer ' + this.accessToken.value,
				},
			});

			switch(response.status) {
				// Healthy response
				case 200: {
					return await response.json();
				}
				// Invalid accessToken
				case 401: {
					await this.accessToken.refreshAccessToken();
					return this.requestCurrentlyPlaying();
				}
				// Any other response
				default: {
					return undefined;
				}
			}
		} catch {
			throw new WebTransportError("Could not reach the Spotify Web API endpoint.");
		}
	}

}