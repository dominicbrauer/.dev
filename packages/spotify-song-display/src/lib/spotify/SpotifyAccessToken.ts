/**
 * Defines the shape of a response from `/api/token`
 * after refreshing an access token.
 */
export interface SpotifyAccessTokenResponse {
	access_token: string;
	token_type: string;
	expires_in: number;
	scope: string;
}

/**
 * Represents a Spotify Web API
 * access token.
 */
export class SpotifyAccessToken {

	/**
	 * The value is the actual token string.
	 * It can be undefined if a new AccessToken
	 * instance has not been granted a token yet.
	 */
	public value: string;

	constructor(tokenValue: string) {
		this.value = tokenValue;
	}

	/**
	 * Refreshes the value of the token or defines a new value if none is set yet.
	 */
	public async refreshAccessToken() {
		try {
			const params = new URLSearchParams([
				['grant_type', 'refresh_token'],
				['refresh_token', import.meta.env.REFRESH_TOKEN]
			]);

			const response = await fetch("https://accounts.spotify.com/api/token", {
				method: 'POST',
				headers: {
					'Authorization': 'Basic ' + import.meta.env.AUTHENTICATION_CODE,
					'Content-Type': 'application/x-www-form-urlencoded',
				},
				body: params.toString(),
			});

			const data = await response.json() as SpotifyAccessTokenResponse;
			this.value = data.access_token;
		} catch {
			throw new WebTransportError("Could not refresh the Spotify Web API access token!");
		}
	}

}