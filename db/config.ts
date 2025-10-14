import { column, defineDb, defineTable } from "astro:db";

const SpotifyWebAPICurrentSong = defineTable({
	columns: {
		id: column.number({ primaryKey: true }),
		song: column.json(),
		is_playing: column.boolean(),
		fetched_at: column.number(),
		progress_ms: column.number({ optional: true }),
		last_played: column.number({ optional: true }),
		access_token: column.text(),
		token_fetched_at: column.number(),
	}
});

export default defineDb({
	tables: {
		SpotifyWebAPICurrentSong
	}
});
