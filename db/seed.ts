import { db, SpotifyWebAPICurrentSong, SteamWebAPIAchievements, SteamWebAPILastFetched, SteamWebAPIPlayerOwnedGames, SteamWebAPIGameLogoPositioning } from 'astro:db';

export default async function() {
	await db.insert(SteamWebAPILastFetched).values([{
		id: 0,
		time: 123
	}]);

	await db.insert(SteamWebAPIPlayerOwnedGames).values([{
		appid: "2050650",
		name: "Resident Evil 4",
		playtime_forever: 5436
	}]);

	await db.insert(SteamWebAPIAchievements).values([
		{
			id: "1",
			name: "Knife Basics",
			description: "Parry an enemy with a knife.",
			hidden: false,
			icon: "https://steamcdn-a.akamaihd.net/steamcommunity/public/images/apps/2050650/57ed9194d804ddd7c5dd753c046870a9a0f58fb1.jpg",
			icon_gray: "https://steamcdn-a.akamaihd.net/steamcommunity/public/images/apps/2050650/67a069adeb240cc284cd2151a8bab067afa2f3ce.jpg",
			achieved: true,
			unlock_time: 1680204591,
			appid: "2050650"
		},
		{
			id: "2",
			name: "My Preferred Piece",
			description: "Upgrade a weapon.",
			hidden: false,
			icon: "https://steamcdn-a.akamaihd.net/steamcommunity/public/images/apps/2050650/a0247551f9d53b3a9aa66f5ee41661177c6ccef9.jpg",
			icon_gray: "https://steamcdn-a.akamaihd.net/steamcommunity/public/images/apps/2050650/4df28bc86b11dcde5da964ac22837013ae32f577.jpg",
			achieved: false,
			unlock_time: 0,
			appid: "2050650"
		},
		{
			id: "9",
			name: "Wave Goodbye, Right Hand",
			description: null,
			hidden: true,
			icon: "https://steamcdn-a.akamaihd.net/steamcommunity/public/images/apps/2050650/07cf575e8a3a7af518c13c1e5d5f4549335356bf.jpg",
			icon_gray: "https://steamcdn-a.akamaihd.net/steamcommunity/public/images/apps/2050650/1a195eb790393fd6a54bd9f2d1d01e8c31dc6b64.jpg",
			achieved: true,
			unlock_time: 1688066948,
			appid: "2050650"
		}
	]);
}