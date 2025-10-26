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
		token_fetched_at: column.number()
	}
});

const SteamWebAPILastFetched = defineTable({
	columns: {
		id: column.number({ primaryKey: true }),
		time: column.number()
	}
});

const SteamWebAPIPlayerOwnedGames = defineTable({
	columns: {
		appid: column.text({ primaryKey: true }),
		name: column.text(),
		playtime_forever: column.number()
	}
});

const SteamWebAPIAchievements = defineTable({
	columns: {
		id: column.text({ primaryKey: true }),
		name: column.text(),
		hidden: column.boolean(),
		description: column.text({ optional: true }),
		icon: column.text(),
		icon_gray: column.text(),
		achieved: column.boolean(),
		unlock_time: column.number(),
		appid: column.text()
	},
	foreignKeys: [
		{
			columns: "appid",
			references: () => SteamWebAPIPlayerOwnedGames.columns.appid
		}
	]
});

const SteamWebAPIGameCompleted = defineTable({
	columns: {
		appid: column.text({ primaryKey: true }),
		complete: column.boolean()
	}
});

const SteamWebAPIGameLogoPositioning = defineTable({
	columns: {
		x: column.number({ optional: true }),
		y: column.number({ optional: true }),
		appid: column.text()
	}
});

export default defineDb({
	tables: {
		SpotifyWebAPICurrentSong,
		SteamWebAPILastFetched,
		SteamWebAPIPlayerOwnedGames,
		SteamWebAPIAchievements,
		SteamWebAPIGameLogoPositioning,
		SteamWebAPIGameCompleted
	}
});
