import { column, defineDb, defineTable } from "astro:db";

const SpotifyWebAPICurrentSong = defineTable({
	columns: {
		id: column.number({ primaryKey: true }),
		song: column.json(),
		progress_ms: column.number({ optional: true }),
		fetched_at: column.number(),
		access_token: column.text(),
		token_fetched_at: column.number(),
		is_playing: column.boolean()
	}
});

export default defineDb({
	tables: {
		SpotifyWebAPICurrentSong
	}
});
