// Refreshes cp.json from Codolio's public profile API. Run by hand: `node update-cp.mjs`.
// The site never calls Codolio itself. It only reads the cp.json this script writes.
import { writeFile } from "node:fs/promises";

const USER = "not-lucifer";
const res = await fetch(`https://api.codolio.com/profile?userKey=${USER}`, { headers: { "User-Agent": "portfolio-stats-update" } });
if (!res.ok) throw new Error(`Codolio answered ${res.status}`);
const body = await res.json();
const platforms = body?.data?.platformProfiles?.platformProfiles;
if (!Array.isArray(platforms)) throw new Error("Unexpected Codolio response: no platformProfiles");
const get = (name) => platforms.find((p) => p.platform === name);

const num = (v) => (Number.isFinite(v) ? v : null);
const lc = get("leetcode");
const cc = get("codechef");
const hr = get("hackerrank");

const out = {
  source: { name: "Codolio", url: `https://codolio.com/profile/${USER}` },
  lastUpdated: new Date().toISOString().slice(0, 10),
  leetcode: lc && {
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
  codechef: cc && {
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
};

await writeFile(new URL("./cp.json", import.meta.url), JSON.stringify(out, null, 2) + "\n");
const total = (out.leetcode?.solved || 0) + (out.codechef?.solved || 0) + (out.hackerrank?.solved || 0);
console.log(`cp.json updated (${out.lastUpdated}): ${total} problems across ${platforms.length} platforms`);
