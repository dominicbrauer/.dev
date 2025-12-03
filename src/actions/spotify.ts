import { CACHE } from "@/lib/cache";
import { SpotifyAccessToken } from "@/lib/spotify/SpotifyAccessToken";
import { SpotifyWebAPI, type SpotifyWebAPICurrentlyPlayingResponse, type SpotifyWebAPIRecentlyPlayedResponse, type SpotifyWebAPISong } from "@/lib/spotify/SpotifyWebAPI";
import { defineAction } from "astro:actions";
import { db, eq, SpotifyWebAPICurrentSong } from "astro:db";

export interface ClientSpotifyResponse {
	song: SpotifyWebAPISong;
	is_playing: boolean;
	fetched_at: number;
	progress_ms: number | null;
	last_played: number | null;
}

export const spotify = {

	/**
	 * Gets spotify song data.
	 */
	requestData: defineAction({
		handler: async (): Promise<ClientSpotifyResponse> => {
			const cachedData = CACHE.get<ClientSpotifyResponse>("spotify_db.entry");
			if (cachedData) return cachedData;

			let [data] = await db.select().from(SpotifyWebAPICurrentSong);

			// database does not have entry yet
			if (!data) {
				data = {
					id: 0,
					song: "",
					is_playing: false,
					access_token: "",
					fetched_at: 0,
					token_fetched_at: 0,
					last_played: null,
					progress_ms: null
				};
				await db.insert(SpotifyWebAPICurrentSong).values(data);
			}

			const currentUTC = new Date();

			// check if data is outdated (30 seconds)
			if (currentUTC > new Date(data.fetched_at + 30_000)) {
				const accessToken = new SpotifyAccessToken(data.access_token);

				// check if access token is expired (one hour - puffer)
				if (currentUTC > new Date(data.token_fetched_at + (3_600_000 - 10_000))) {
					await accessToken.refreshAccessToken();
					data.access_token = accessToken.value;
					data.token_fetched_at = currentUTC.getTime();
				}

				const api = new SpotifyWebAPI(accessToken);
				let currentlyPlayingResponse: SpotifyWebAPICurrentlyPlayingResponse | undefined;
				let recentlyPlayedResponse: SpotifyWebAPIRecentlyPlayedResponse | undefined;

				currentlyPlayingResponse = await api.requestCurrentlyPlaying();

				if (!currentlyPlayingResponse) {
					recentlyPlayedResponse = await api.requestRecentlyPlayed();
					data.song = JSON.stringify(recentlyPlayedResponse?.items[0].track);
					data.is_playing = false;
					data.last_played = Date.now() - Date.parse(recentlyPlayedResponse?.items[0].played_at!);
				} else {
					data.song = JSON.stringify(currentlyPlayingResponse.item);
					data.is_playing = currentlyPlayingResponse.is_playing;
					data.progress_ms = currentlyPlayingResponse.progress_ms;
					data.last_played = null;
				}

				data.fetched_at = currentUTC.getTime();
				await db.update(SpotifyWebAPICurrentSong).set(data).where(eq(SpotifyWebAPICurrentSong.id, 0));
			}

			CACHE.set("spotify_db.entry", {
				...data,
				song: JSON.parse(data.song as string)
			}, 30_000);

			return {
				...data,
				song: JSON.parse(data.song as string)
			};
		}
	})

}
