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
	request: defineAction({
		handler: async (): Promise<ClientSpotifyResponse> => {
			const data = (await db.select().from(SpotifyWebAPICurrentSong))[0];
			const currentUTC = new Date();
			
			// check if data is outdated (30 seconds)
			if (currentUTC > new Date(data.fetched_at + 30000)) {
				const accessToken = new SpotifyAccessToken(data.access_token);
				
				// check if access token is expired (one hour - puffer)
				if (currentUTC > new Date(data.token_fetched_at + (3600000 - 10000))) {
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

			return {
				song: JSON.parse(data.song as string),
				is_playing: data.is_playing,
				fetched_at: data.fetched_at,
				progress_ms: data.progress_ms,
				last_played: data.last_played
			};
		}
	})
}