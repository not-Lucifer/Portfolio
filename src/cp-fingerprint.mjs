// A short hash of the stats that appear on the site (everything except the "last updated" date).
// The build publishes it as /stats-version.txt; the weekly workflow compares it with fresh Codolio
// numbers and only triggers a (paid) Netlify deploy when something actually changed.
import { createHash } from "node:crypto";

export function cpFingerprint(cp) {
  const { lastUpdated, ...stats } = cp;
  return createHash("sha256").update(JSON.stringify(stats)).digest("hex").slice(0, 16);
}
