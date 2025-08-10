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
 * 
 */
export class SpotifyAccessToken {

	/**
	 * The value is the actual token string.
	 * It can be undefined if a new AccessToken
	 * instance has not been granted a token yet.
	 */
	private value: string | undefined = undefined;

	/**
	 * Gets the current value of the AccessToken.
	 * If the token is expired, it will first be refreshed.
	 * @returns valid acccess token.
	 */
	public async getValue() {
		if (!await this.isValid()) {
			await this.refreshAccessToken();
		}
		return this.value;
	}

	/**
	 * Verifies if the access token is valid.
	 * @returns false if the token is expired.
	 */
	private async isValid(): Promise<boolean> {
		try {
			const response = await fetch("https://api.spotify.com/v1/me", {
				method: 'GET',
				headers: {
					'Authorization': 'Bearer ' + this.value,
				},
			});

			return response.ok;
		} catch {
			throw new WebTransportError("Could not reach the Spotify Web API endpoint.");
		}
	}

	/**
	 * Refreshes the value of the token or defines a new value if none is set yet.
	 */
	private async refreshAccessToken() {
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

			if (!response.ok) {
				return;
			}

			const data: SpotifyAccessTokenResponse = await response.json();
			
			this.value = data.access_token;
		} catch {
			throw new WebTransportError("Could not reach the Spotify Web API endpoint.");
		}
	}

}