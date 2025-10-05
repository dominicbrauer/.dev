import { SpotifyAccessToken } from "@/lib/spotify/SpotifyAccessToken";
import { SpotifyWebAPI, type SpotifyWebAPIRecentlyPlayedResponse, type SpotifyWebAPISong } from "@/lib/spotify/SpotifyWebAPI";
import { defineAction } from "astro:actions";
import { db, eq, SpotifyWebAPICurrentSong } from "astro:db";

export interface ClientSpotifyResponse {
	song: string;
	progress_ms: number | null;
	fetched_at: number;
	is_playing: boolean;
}

export const spotify = {
	request: defineAction({
		handler: async (): Promise<ClientSpotifyResponse> => {
			const data = (await db.select().from(SpotifyWebAPICurrentSong))[0];
			const currentUTC = new Date();

			if (currentUTC > new Date(data.fetched_at + 30 * 1000)) {
				const accessToken = new SpotifyAccessToken(data.access_token);

				if (currentUTC > new Date(data.token_fetched_at + 3600 * 1000)) {
					await accessToken.refreshAccessToken();
					data.access_token = accessToken.value;
					data.token_fetched_at = currentUTC.getTime();
				}

				const api = new SpotifyWebAPI(accessToken);
				const currentlyPlayingResponse = await api.requestCurrentlyPlaying();

				let recentlyPlayedResponse: SpotifyWebAPIRecentlyPlayedResponse | undefined;
				if (!currentlyPlayingResponse) {
					recentlyPlayedResponse = await api.requestRecentlyPlayed();
					data.is_playing = false;
				} else {
					data.is_playing = currentlyPlayingResponse.is_playing;
				}

				data.fetched_at = currentUTC.getTime();
				data.song = JSON.stringify(currentlyPlayingResponse?.item) || JSON.stringify(recentlyPlayedResponse?.items[0].track);
				data.progress_ms = currentlyPlayingResponse?.progress_ms || null;

				await db.update(SpotifyWebAPICurrentSong).set(data).where(eq(SpotifyWebAPICurrentSong.id, 0));
			}

			return {
				song: data.song as string,
				progress_ms: data.progress_ms,
				fetched_at: data.fetched_at,
				is_playing: data.is_playing
			};
		}
	})
}