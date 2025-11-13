/**
 * Raw response structure for 'GetSchemaForGame'.
 */
interface SteamWebAPIGameSchemaRaw {
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

interface SteamWebAPIPlayerAchievementsRaw {
	playerstats: {
		steamID: string;
		gameName: string;
		achievements: {
			apiname: string;
			achieved: boolean;
			unlocktime: number;
		}[];
	}
}

/**
 * Represents a game achievement.
 */
export interface SteamWebAPIAchievement {
	id: string;
	name: string;
	hidden: boolean;
	description: string | null;
	icon: string;
	icon_gray: string;
	achieved: boolean;
	unlock_time: number;
	appid: string;
}

/**
 * Represents a game owned by a user.
 */
export interface SteamWebAPIPlayerOwnedGame {
	appid: string;
	name: string;
	playtime_forever: number;
}

type ImageType = 'header' | 'library_hero' | 'logo' | 'portrait';

const imageTypes = new Map<ImageType, string>([
	["header", "header.jpg"],
	["library_hero", "library_hero.jpg"],
	["logo", "logo.png"],
	["portrait", "library_600x900.jpg"]
]);

/**
 * The Steamworks Web API bundles all endpoints for retrieving game and user data.
 */
export class SteamWebAPI {

	/**
	 * Gets an image type from the specified game.
	 * @param appid the games appid
	 * @param type type of the image (header, library_hero, logo)
	 * @returns url string to that image
	 */
	public getGameImage(appid: string, type: ImageType) {
		return `https://cdn.akamai.steamstatic.com/steam/apps/${appid}/${imageTypes.get(type)}`;
	}

	/**
	 * Retrieves the achievements for a game.
	 * @param appid the id for the specific game
	 * @returns list of achievements
	 */
	public async requestGameAchievements(appid: string): Promise<SteamWebAPIAchievement[] | undefined> {
		try {
			const gameSchemaURL = new URL("https://api.steampowered.com/ISteamUserStats/GetSchemaForGame/v2/");
			gameSchemaURL.search = new URLSearchParams({
				'key': import.meta.env.STEAM_API_KEY,
				'appid': appid
			}).toString();

			const playerAchievementsURL = new URL("https://api.steampowered.com/ISteamUserStats/GetPlayerAchievements/v1/");
			playerAchievementsURL.search = new URLSearchParams({
				'key': import.meta.env.STEAM_API_KEY,
				'steamid': import.meta.env.STEAM_USER_ID,
				'appid': appid
			}).toString();

			const gameSchemaResponse = await fetch(gameSchemaURL, {
				method: 'GET'
			});
			const playerAchievementsResponse = await fetch(playerAchievementsURL, {
				method: 'GET'
			});

			if (!gameSchemaResponse.ok) {
				return undefined;
			}

			const gameSchema = await gameSchemaResponse.json() as SteamWebAPIGameSchemaRaw;
			const playerAchievements = await playerAchievementsResponse.json() as SteamWebAPIPlayerAchievementsRaw;

			return gameSchema.game.availableGameStats?.achievements.map((achievement) => (
				{
					id: appid + "/" + achievement.name,
					name: achievement.displayName,
					hidden: achievement.hidden,
					description: achievement.description,
					icon: achievement.icon,
					icon_gray: achievement.icongray,
					appid,
					achieved: playerAchievementsResponse.ok ? playerAchievements.playerstats.achievements.find((entry) => entry.apiname === achievement.name)?.achieved : false,
					unlock_time: playerAchievementsResponse.ok ? playerAchievements.playerstats.achievements.find((entry) => entry.apiname === achievement.name)?.unlocktime : 0
				} as SteamWebAPIAchievement
			));
		} catch (err) {
			console.log("this broken:" + appid);
			console.log("ERROR: " + err);
			return undefined;
		}
	}

	/**
	 * Retrieves all games a player owns.
	 * @returns list of games
	 */
	public async requestPlayerOwnedGames(): Promise<SteamWebAPIPlayerOwnedGame[] | undefined> {

		try {
			const url = new URL("https://api.steampowered.com/IPlayerService/GetOwnedGames/v1/");
			url.search = new URLSearchParams({
				'key': import.meta.env.STEAM_API_KEY,
				'steamid': import.meta.env.STEAM_USER_ID,
				'include_appinfo': 'true',
				'include_played_free_games': 'true'
			}).toString();

			const response = await fetch(url, {
				method: 'GET',
			});

			if (!response.ok) {
				return undefined;
			}

			return (await response.json()).response.games.map((game: { appid: number, name: string, playtime_forever: string }) => (
				{
					...game,
					appid: `${game.appid}`
				}
			));
		} catch (err) {
			console.log("ERROR: " + err);
			return undefined;
		}
	}

}