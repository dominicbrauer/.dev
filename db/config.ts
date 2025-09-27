import { column, defineDb, defineTable } from "astro:db";

const SpotifyWebAPICurrentlyPlaying = defineTable({
	columns: {
		data_id: column.number({ primaryKey: true }),
		data: column.json(),
		fetched_at: column.number(),
		access_token: column.text(),
		live: column.boolean()
	}
});

export default defineDb({
	tables: {
		SpotifyWebAPICurrentlyPlaying
	}
});
