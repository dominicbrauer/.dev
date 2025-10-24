/**
 * Raw response structure for 'GetSchemaForGame'.
 */
interface SteamGameSchemaRaw {
	game: {
		gameName: string;
		availableGameStats: {
			achievements: {
				name: string;
				displayName: string;
				hidden: boolean;
				description: string;
				icon: string;
				icongray: string;
			}[];
		};
	};
}

/**
 * Represents a game achievement.
 */
export interface SteamGameAchievement {
	id: string;
	name: string;
	hidden: boolean;
	description: string;
	icon: string;
	icon_gray: string;
}

/**
 * Represents an achievement per game for a user.
 */
export interface SteamPlayerAchievement {
	apiname: string;
	achieved: boolean;
	unlocktime: number;
}

/**
 * Represents a game owned by a user.
 */
export interface SteamPlayerOwnedGame {
	appid: string;
	name: string;
	playtime_forever: number;
}

/**
 * The Steamworks Web API bundles all endpoints for retrieving game and user data.
 */
export class SteamWebAPI {

	/**
	 * Gets the string URL for a games header image.
	 * @param appid the id for the specific game
	 * @returns the image url
	 */
	public getGameCoverURL(appid: string) {
		return `https://cdn.akamai.steamstatic.com/steam/apps/${appid}/header.jpg`;
	}

	/**
	 * Retrieves the achievements for a game.
	 * @param appid the id for the specific game
	 * @returns list of achievements
	 */
	public async requestGameSchema(appid: string): Promise<SteamGameAchievement[] | undefined> {
		try {
			const url = new URL("https://api.steampowered.com/ISteamUserStats/GetSchemaForGame/v2/");
			url.search = new URLSearchParams({
				'key': import.meta.env.STEAM_API_KEY,
				'appid': appid
			}).toString();

			const response = await fetch(url, {
				method: 'GET'
			});

			if (!response.ok) {
				return undefined;
			}

			return (await response.json() as SteamGameSchemaRaw).game.availableGameStats.achievements.map((achievement) => (
				{
					id: achievement.name,
					name: achievement.displayName,
					description: achievement.description,
					hidden: achievement.hidden,
					icon: achievement.icon,
					icon_gray: achievement.icongray
				} as SteamGameAchievement
			));
		} catch (err) {
			console.log("ERROR: " + err);
			return undefined;
		}
	}

	/**
	 * Retrieves the mapped achievements for a user per game.
	 * @param appid the id for the specific game
	 * @returns list of player achievements
	 */
	public async requestPlayerAchievements(appid: string): Promise<SteamPlayerAchievement[] | undefined> {
		try {
			const url = new URL("https://api.steampowered.com/ISteamUserStats/GetPlayerAchievements/v1/");
			url.search = new URLSearchParams({
				'key': import.meta.env.STEAM_API_KEY,
				'steamid': import.meta.env.STEAM_USER_ID,
				'appid': appid
			}).toString();

			const response = await fetch(url, {
				method: 'GET'
			});

			if (!response.ok) {
				return undefined;
			}

			return (await response.json()).playerstats.achievements as SteamPlayerAchievement[];
		} catch (err) {
			console.log("ERROR: " + err);
			return undefined;
		}
	}

	/**
	 * Retrieves all games a player owns.
	 * @returns list of games
	 */
	public async requestPlayerOwnedGames(): Promise<SteamPlayerOwnedGame[] | undefined> {

		try {
			const url = new URL("https://api.steampowered.com/IPlayerService/GetOwnedGames/v1/");
			url.search = new URLSearchParams({
				'key': import.meta.env.STEAM_API_KEY,
				'steamid': import.meta.env.STEAM_USER_ID,
				'include_appinfo': 'true',
				'include_played_free_games': 'false'
			}).toString();

			const response = await fetch(url, {
				method: 'GET',
			});

			if (!response.ok) {
				return undefined;
			}

			return (await response.json()).response.games as SteamPlayerOwnedGame[];
		} catch (err) {
			console.log("ERROR: " + err);
			return undefined;
		}
	}

}