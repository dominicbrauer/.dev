import { db, SpotifyWebAPICurrentlyPlaying } from 'astro:db';

export default async function() {
	await db.insert(SpotifyWebAPICurrentlyPlaying).values([
    { 
		data_id: 0,
		data: "{}",
		fetched_at: 1,
		access_token: "abc",
		live: false
	}
  ]);
}
