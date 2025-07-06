// helpers/timeFilter.js
const { DateTime } = require("luxon");      // lightweight date lib

/**
 * Keep records whose last_update is no older than `windowMin` minutes.
 * `last_update` comes as "DD-MM-YYYY HH:mm:ss" in local IST (UTC+5:30).
 */
function filterByRecent(records, windowMin = 15) {
  const nowUTC = DateTime.utc();
  const cutoff = nowUTC.minus({ minutes: windowMin });

  return records.filter((r) => {
    if (!r.last_update) return false;

    const ist = DateTime.fromFormat(
      r.last_update,
      "dd-MM-yyyy HH:mm:ss",
      { zone: "Asia/Kolkata" }              // IST
    );
    return ist.toUTC() >= cutoff;
  });
}

module.exports = { filterByRecent };
