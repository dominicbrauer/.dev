import { db, SpotifyWebAPICurrentSong } from 'astro:db';

export default async function() {
	await db.insert(SpotifyWebAPICurrentSong).values([{
		id: 0,
		song: "{}",
		fetched_at: 123,
		access_token: "abc123",
		token_fetched_at: 123,
		is_playing: false,
		progress_ms: null
	}]);
}