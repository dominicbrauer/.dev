interface ImportMetaEnv {
	/**
	 * The refresh token is used to receive a new access token without the authentication procedure.
	 */
	readonly REFRESH_TOKEN: string;

	/**
	 * The authentication code is the Base64-encoded value of `client_id:client_secret`.
	 * It is necessary for getting a new access token using the `refreshToken`.
	 */
	readonly AUTHENTICATION_CODE: Base64URLString;
}

interface ImportMeta {
	readonly env: ImportMetaEnv;
}