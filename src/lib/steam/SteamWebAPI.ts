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

export interface SteamGameSchema {
	name: string;
	achievements: {
		id: string;
		name: string;
		hidden: boolean;
		description: string;
		icon: URL;
		icon_gray: URL;
	}[];
}

export interface SteamPlayerAchievement {
	apiname: string;
	achieved: boolean;
	unlocktime: number;
}

export interface SteamPlayerOwnedGames {
	game_count: number;
	games: {
		appid: number;
		name: string;
		playtime_forever: number;
	}[];
}

export class SteamWebAPI {

	constructor() {

	}

	public getGameCoverURL(appid: string) {
		return `https://cdn.akamai.steamstatic.com/steam/apps/${appid}/header.jpg`;
	}

	public async requestGameSchema(appid: string): Promise<SteamGameSchema | undefined> {
		try {
			const params = new URLSearchParams([
				['key', import.meta.env.STEAM_API_KEY],
				['appid', appid]
			]);

			const response = await fetch("https://api.steampowered.com/ISteamUserStats/GetSchemaForGame/v2/", {
				method: 'GET',
				body: params.toString(),
			});

			if (!response.ok) {
				return undefined;
			}

			const rawData = await response.json() as SteamGameSchemaRaw;
			return {
				name: rawData.game.gameName,
				achievements: rawData.game.availableGameStats.achievements.map((achievement) => (
					{
						id: achievement.name,
						name: achievement.displayName,
						description: achievement.description,
						hidden: achievement.hidden,
						icon: new URL(achievement.icon),
						icon_gray: new URL(achievement.icongray)
					}
				))
			} as SteamGameSchema;
		} catch {
			return undefined;
		}
	}

	public async requestPlayerAchievements(appid: string): Promise<SteamPlayerAchievement[] | undefined> {
		try {
			const params = new URLSearchParams([
				['key', import.meta.env.STEAM_API_KEY],
				['steamid', import.meta.env.STEAM_USER_ID],
				['appid', appid]
			]);

			const response = await fetch("https://api.steampowered.com/ISteamUserStats/GetPlayerAchievements/v1/", {
				method: 'GET',
				body: params.toString(),
			});

			if (!response.ok) {
				return undefined;
			}

			return (await response.json()).playerstats.achievements as SteamPlayerAchievement[];
		} catch {
			return undefined;
		}
	}

	public async requestPlayerOwnedGames(): Promise<SteamPlayerOwnedGames | undefined> {
		try {
			const params = new URLSearchParams([
				['key', import.meta.env.STEAM_API_KEY],
				['steamid', import.meta.env.STEAM_USER_ID],
				['include_appinfo', 'true'],
				['include_played_free_games', 'false']
			]);

			//console.log("mogus");

			const response = await fetch("https://api.steampowered.com/IPlayerService/GetOwnedGames/v1/", {
				method: 'GET',
				body: params.toString(),
			});
			console.log("osdnfnds");
			console.log(response.status);

			if (!response.ok) {
				return undefined;
			}

			console.log("mogus");
			console.log(await response.json());

			return (await response.json()).response as SteamPlayerOwnedGames;
		} catch {
			return undefined;
		}
	}

}