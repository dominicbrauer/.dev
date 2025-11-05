import { SteamWebAPI, type SteamWebAPIAchievement } from "@/lib/steam/SteamWebAPI";
import { db, SteamWebAPIAchievements, SteamWebAPILastFetched, SteamWebAPIPlayerOwnedGames, SteamWebAPIGameCompleted } from "astro:db";
import { defineMiddleware } from "astro:middleware";

export const onRequest = defineMiddleware(async (context, next) => {
	if (context.url.pathname.startsWith("/steam")) {
		await handleSteamRequest();
	}

	return next();
});

async function handleSteamRequest() {
	const lastFetchedData = (await db.select().from(SteamWebAPILastFetched))[0];
	const now = Date.now();

	// skip if the last request was less than 12 hours ago
	if (now < lastFetchedData.time + 60000 * 12) {
		return;
	}

	console.log("LOAD!");

	await db.update(SteamWebAPILastFetched).set({ time: now });
	const steamAPI = new SteamWebAPI();

	const games = await steamAPI.requestPlayerOwnedGames() || [];

	const gameQueries: any[] = [];
	const achievementQueries: any[] = [];
	const gameCompleteQueries: any[] = [];
	const achievementPromises: Promise<SteamWebAPIAchievement[] | undefined>[] = [];

	for (const game of games) {
		gameQueries.push(
			db.insert(SteamWebAPIPlayerOwnedGames).values(game).onConflictDoUpdate({
				target: SteamWebAPIPlayerOwnedGames.appid,
				set: {
					...game
				}
			})
		);

		achievementPromises.push(steamAPI.requestGameAchievements(game.appid));
	}

	const resolvedAchievements = (await Promise.all(achievementPromises)).filter((value) => !!value).flat();

	for (const achievement of resolvedAchievements) {
		achievementQueries.push(
			db.insert(SteamWebAPIAchievements).values(achievement).onConflictDoUpdate({
				target: SteamWebAPIAchievements.id,
				set: {
					...achievement
				}
			})
		);
	}

	for (const game of games) {
		const achievements = resolvedAchievements.filter((achievement) => achievement.appid === game.appid);
		const isComplete = achievements.length > 0 && achievements.every((achievement) => achievement.achieved);
		gameCompleteQueries.push(
			db.insert(SteamWebAPIGameCompleted).values({
				appid: game.appid,
				complete: isComplete
			}).onConflictDoUpdate({
				target: SteamWebAPIGameCompleted.appid,
				set: {
					complete: isComplete
				}
			})
		);
	}

	await db.batch([
		...gameQueries,
		...achievementQueries,
		...gameCompleteQueries
	] as any);

}