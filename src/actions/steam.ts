import { CACHE } from "@/lib/cache";
import { SteamWebAPI, type SteamWebAPIAchievement, type SteamWebAPIPlayerOwnedGame } from "@/lib/steam/SteamWebAPI";
import { z } from "astro/zod";
import { defineAction } from "astro:actions";

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
				if (appid) {
					// await steam.getAchievements({ appid }); // guarantee that achievements exist
					return games.filter((game) => game.appid === appid);
				}
				return games;
			}

			games = await SteamWebAPI.requestPlayerOwnedGames() || [];

			CACHE.set("steam_db.player_games", games, 43_200_000);

			if (appid) {
				// await steam.getAchievements({ appid }); // guarantee that achievements exist
				return games.filter((game) => game.appid === appid);
			}
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
			let achievements = CACHE.get<SteamWebAPIAchievement[]>(`steam_db.player_achievements.${appid}`);

			if (achievements) return achievements.filter((achievement) => achievement.appid === appid);

			achievements = await SteamWebAPI.requestGameAchievements(appid) || [];

			CACHE.set(`steam_db.player_achievements.${appid}`, achievements, 43_200_000);

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
			// contributed by Kim Wolf
			const { data: achievements, error } = await steam.getAchievements({ appid });

			if (achievements) return achievements.every((achievement) => achievement.achieved);

			return false;
		}
	})

}
