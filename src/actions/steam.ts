import { CACHE } from "@/lib/cache";
import { type SteamWebAPIAchievement, type SteamWebAPIPlayerOwnedGame } from "@/lib/steam/SteamWebAPI";
import { z } from "astro/zod";
import { defineAction } from "astro:actions";
import { SteamWebAPIGameCompleted } from "astro:db";
import { db, SteamWebAPIAchievements, SteamWebAPIPlayerOwnedGames } from "astro:db";

export const steam = {

	/**
	 * Gets all owned steam games. If an appid is given, only that game is returned.
	 * @param appid id specifying a game
	 * @returns list of owned steam games
	 */
	getGames: defineAction({
		input: z.object({
			appid: z.optional(z.string())
		}),
		handler: async ({appid}): Promise<SteamWebAPIPlayerOwnedGame[]> => {
			let games = CACHE.get<SteamWebAPIPlayerOwnedGame[]>("steam_db.player_games");

			if (games) {
				if (appid) return games.filter((game) => game.appid === appid);
				return games;
			}

			games = await db.select().from(SteamWebAPIPlayerOwnedGames);

			CACHE.set("steam_db.player_games", games, 43_200_000);

			if (appid) return games.filter((game) => game.appid === appid);
			return games;
		}
	}),

	/**
	 * Gets all steam achievements for a game.
	 * @param appid id specifying the game
	 * @returns list of achievements
	 */
	getAchievements: defineAction({
		input: z.object({
			appid: z.string()
		}),
		handler: async ({appid}): Promise<SteamWebAPIAchievement[]> => {
			let achievements = CACHE.get<SteamWebAPIAchievement[]>("steam_db.player_achievements");

			if (achievements) return achievements.filter((achievement) => achievement.appid === appid);

			achievements = await db.select().from(SteamWebAPIAchievements);

			CACHE.set("steam_db.owned_games", achievements, 43_200_000);

			return achievements.filter((achievement) => achievement.appid === appid);
		}
	}),

	/**
	 * Gets the completion status for an owned steam game.
	 * @param appid id specifying the game
	 * @returns true if completed
	 */
	getCompletionStatus: defineAction({
		input: z.object({
			appid: z.string()
		}),
		handler: async ({appid}): Promise<boolean> => {
			let completions = CACHE.get<{appid: string, complete: boolean}[]>("steam_db.game_completions");

			if (completions) return completions.find((completion) => completion.appid === appid)!.complete;

			completions = await db.select().from(SteamWebAPIGameCompleted);

			CACHE.set("steam_db.game_completions", completions, 43_200_000);

			return completions.find((completion) => completion.appid === appid)!.complete;
		}
	})

}
