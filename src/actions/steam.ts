import { CACHE } from "@/lib/cache";
import { type SteamWebAPIPlayerOwnedGame, SteamWebAPI } from "@/lib/steam/SteamWebAPI";
import { z } from "astro/zod";
import { defineAction } from "astro:actions";
import { db, eq, SteamWebAPIPlayerOwnedGames } from "astro:db";

export const steam = {

	/**
	 * Gets all owned steam games. If an appid is given, only that game is returned.
	 * @param appid id specifying a game
	 * @returns list of owned steam games
	 */
	requestGame: defineAction({
		input: z.object({
			appid: z.optional(z.string())
		}),
		handler: async (appid): Promise<SteamWebAPIPlayerOwnedGame[]> => {

			let games = CACHE.get<SteamWebAPIPlayerOwnedGame[]>("steam_db.owned_games");

			if (games) {
				if (appid) return games.filter((game) => game.appid === appid);
				return games;
			}

			games = await db.select().from(SteamWebAPIPlayerOwnedGames);

			CACHE.set("steam_db.owned_games", games);

			if (appid) return games.filter((game) => game.appid === appid);
			return games;
		}
	})

}
