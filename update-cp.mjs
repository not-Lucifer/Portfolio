// Refreshes cp.json from Codolio's public profile API.
//   node update-cp.mjs          → by hand; fails loudly if Codolio can't be read
//   node update-cp.mjs --soft   → Netlify build; on any problem keeps the existing cp.json and carries on
// The site never calls Codolio from the visitor's browser. It only reads the cp.json this script writes.
import { readFile, writeFile } from "node:fs/promises";

const USER = "not-lucifer";
const FILE = new URL("./cp.json", import.meta.url);
const soft = process.argv.includes("--soft");

async function fetchStats() {
  const res = await fetch(`https://api.codolio.com/profile?userKey=${USER}`, {
    headers: { "User-Agent": "portfolio-stats-update" },
    signal: AbortSignal.timeout(15000),
  });
  if (!res.ok) throw new Error(`Codolio answered ${res.status}`);
  const body = await res.json();
  const platforms = body?.data?.platformProfiles?.platformProfiles;
  if (!Array.isArray(platforms)) throw new Error("unexpected Codolio response: no platformProfiles");
  const get = (name) => platforms.find((p) => p.platform === name);

  const num = (v) => (Number.isFinite(v) ? v : null);
  const lc = get("leetcode");
  const cc = get("codechef");
  const hr = get("hackerrank");
  // The site's numbers slide needs these; refuse a response that's missing them rather than publish blanks.
  if (!Number.isFinite(lc?.totalQuestionStats?.totalQuestionCounts) || !Number.isFinite(cc?.totalQuestionStats?.totalQuestionCounts)) {
    throw new Error("Codolio response is missing LeetCode or CodeChef totals");
  }

  return {
    platformCount: platforms.length,
    data: {
      source: { name: "Codolio", url: `https://codolio.com/profile/${USER}` },
      lastUpdated: new Date().toISOString().slice(0, 10),
      leetcode: {
        handle: lc.userStats.handle,
        rating: num(lc.userStats.currentRating),
        peak: num(lc.userStats.maxRating),
        contests: lc.contestActivityStats?.contestActivityList?.length ?? 0,
        solved: num(lc.totalQuestionStats.totalQuestionCounts),
        easy: num(lc.totalQuestionStats.easyQuestionCounts),
        medium: num(lc.totalQuestionStats.mediumQuestionCounts),
        hard: num(lc.totalQuestionStats.hardQuestionCounts),
        activeDays: num(lc.dailyActivityStatsResponse?.totalActiveDays),
        maxStreak: num(lc.dailyActivityStatsResponse?.maxStreak),
        badges: (lc.badgeStats?.badgeList || []).map((b) => b.displayName).filter(Boolean),
        languages: lc.userStats.languageList || [],
        topics: lc.topicAnalysisStats?.topicWiseDistribution || {},
      },
      codechef: {
        handle: cc.userStats.handle,
        rating: num(cc.userStats.currentRating),
        peak: num(cc.userStats.maxRating),
        stars: num(cc.userStats.stars),
        contests: cc.contestActivityStats?.contestActivityList?.length ?? 0,
        solved: num(cc.totalQuestionStats.totalQuestionCounts),
        ratingHistory: (cc.contestActivityStats?.contestActivityList || []).map((c) => c.rating),
      },
      hackerrank: hr && {
        handle: hr.userStats.handle,
        solved: num(hr.totalQuestionStats.totalQuestionCounts),
      },
    },
  };
}

try {
  const { data, platformCount } = await fetchStats();
  await writeFile(FILE, JSON.stringify(data, null, 2) + "\n");
  const total = (data.leetcode.solved || 0) + (data.codechef.solved || 0) + (data.hackerrank?.solved || 0);
  console.log(`cp.json updated (${data.lastUpdated}): ${total} problems across ${platformCount} platforms`);
} catch (err) {
  if (!soft) throw err;
  const kept = JSON.parse(await readFile(FILE, "utf8")).lastUpdated;
  console.warn(`! Couldn't refresh stats from Codolio (${err.message}). Keeping cp.json from ${kept}.`);
}
