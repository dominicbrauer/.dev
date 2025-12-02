import { SteamWebAPI, type SteamWebAPIAchievement } from "@/lib/steam/SteamWebAPI";
import { db, SteamWebAPIAchievements, SteamWebAPILastFetched, SteamWebAPIPlayerOwnedGames, SteamWebAPIGameCompleted, eq } from "astro:db";
import { defineMiddleware } from "astro:middleware";

export const onRequest = defineMiddleware(async (context, next) => {
	if (context.url.pathname.startsWith("/steam")) {
		await handleSteamRequest();
	}

	return next();
});

async function handleSteamRequest() {
	const lastFetchedData = (await db.select().from(SteamWebAPILastFetched))[0] || {
		id: 1,
		time: 0
	};
	const now = Date.now();

	// entry does not exist yet
	if (lastFetchedData.id === 1) {
		await db.insert(SteamWebAPILastFetched).values({
			id: 0,
			time: 0
		});
		lastFetchedData.id = 0;
	}

	// skip if the last request was less than 12 hours ago
	if (now < lastFetchedData.time + 43_200_000) {
		return;
	}

	const [_, knownGames, knownAchievements, knownGameCompletions] = await db.batch([
 		db.update(SteamWebAPILastFetched).set({ time: now }),
		db.select().from(SteamWebAPIPlayerOwnedGames),
		db.select().from(SteamWebAPIAchievements),
		db.select().from(SteamWebAPIGameCompleted)
	]);
	const steamAPI = new SteamWebAPI();

	const games = await steamAPI.requestPlayerOwnedGames() || [];

	const gameQueries: any[] = [];
	const achievementQueries: any[] = [];
	const gameCompleteQueries: any[] = [];
	const achievementPromises: Promise<SteamWebAPIAchievement[] | undefined>[] = [];

	for (const game of games) {
		if (!knownGames.find((knownGame) => knownGame.appid === game.appid)) {
			gameQueries.push(
				db.insert(SteamWebAPIPlayerOwnedGames).values(game)
			);
		} else {
			gameQueries.push(
				db.update(SteamWebAPIPlayerOwnedGames).set({
					...game,
					appid: undefined
				}).where(eq(SteamWebAPIPlayerOwnedGames.appid, game.appid))
			);
		}

		achievementPromises.push(steamAPI.requestGameAchievements(game.appid));
	}

	const resolvedAchievements = (await Promise.all(achievementPromises)).filter((value) => !!value).flat();

	for (const achievement of resolvedAchievements) {
		if (!knownAchievements.find((knownAchievement) => knownAchievement.id === achievement.id)) {
			achievementQueries.push(
				db.insert(SteamWebAPIAchievements).values(achievement)
			);
		} else {
			achievementQueries.push(
				db.update(SteamWebAPIAchievements).set({
					...achievement,
					id: undefined
				}).where(eq(SteamWebAPIAchievements.id, achievement.id))
			);
		}
	}

	for (const game of games) {
		const achievements = resolvedAchievements.filter((achievement) => achievement.appid === game.appid);
		const isComplete = achievements.length > 0 && achievements.every((achievement) => achievement.achieved);
		if (!knownGameCompletions.find((knownGameCompletion) => knownGameCompletion.appid === game.appid)) {
			gameCompleteQueries.push(
				db.insert(SteamWebAPIGameCompleted).values({
					appid: game.appid,
					complete: isComplete
				})
			);
		} else {
			gameCompleteQueries.push(
				db.update(SteamWebAPIGameCompleted).set({
					complete: isComplete
				}).where(eq(SteamWebAPIGameCompleted.appid, game.appid))
			);
		}
	}

	await db.batch([
		...gameQueries,
		...achievementQueries,
		...gameCompleteQueries
	] as any);

}
