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

			if (!games) {
				games = await SteamWebAPI.requestPlayerOwnedGames() || [];

				CACHE.set(
					"steam_db.player_games",
					games,
					43_200_000
				);
			}

			if (appid) return games.filter((game) => game.appid === appid);
			return games;
		}
	}),

	/**
	 * Gets all steam achievements for a game.
	 * @param appid id specifying the game
	 * @returns object with list of achievements and completion info
	 */
	getAchievements: defineAction({
		input: z.object({
			appid: z.string()
		}),
		handler: async ({ appid }): Promise<{ achievements: SteamWebAPIAchievement[], complete: boolean }> => {
			let achievements = CACHE.get<SteamWebAPIAchievement[]>(`steam_db.game_achievements.${appid}`);

			if (!achievements) {
				achievements = await SteamWebAPI.requestGameAchievements(appid) || [];

				CACHE.set(
					`steam_db.game_achievements.${appid}`,
					achievements,
					43_200_000
				);
			}

			let complete = CACHE.get<boolean>(`steam_db.game_completion.${appid}`);

			if (complete === undefined) {
				complete = achievements.length > 0 && achievements.every((achievement) => achievement.achieved);

				CACHE.set(
					`steam_db.game_completion.${appid}`,
					complete,
					43_200_000
				);
			}

			return { achievements, complete };
		}
	})

}
