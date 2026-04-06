/**
 * Fitness date utilities for timezone-aware date key normalization
 * Prevents cross-day misclassification when users are in different timezones
 */

/**
 * Normalize a date to YYYY-MM-DD format (local timezone aware)
 * @param {Date|string|number} date - Date object, ISO string, or timestamp
 * @param {string} timezone - IANA timezone string (e.g., 'America/New_York', 'UTC')
 * @returns {string} Normalized dateKey in YYYY-MM-DD format
 * @example
 * normalizeDateKey(new Date(), 'America/New_York') // '2026-02-28'
 * normalizeDateKey('2026-02-28T15:30:00Z', 'Asia/Kolkata') // '2026-02-28' or '2026-03-01' depending on local time
 */
function normalizeDateKey(date, timezone = 'UTC') {
  let dateObj;

  if (typeof date === 'string') {
    dateObj = new Date(date);
  } else if (typeof date === 'number') {
    dateObj = new Date(date);
  } else if (date instanceof Date) {
    dateObj = date;
  } else {
    dateObj = new Date();
  }

  // Format date in the specified timezone
  const localDate = getLocalDateInTimezone(dateObj, timezone);

  // Return YYYY-MM-DD format
  return localDate.toISOString().split('T')[0];
}

/**
 * Get a Date object adjusted to represent local time in a specific timezone
 * @param {Date} date - UTC date
 * @param {string} timezone - IANA timezone string
 * @returns {Date} Date object representing local date (UTC time is shifted)
 */
function getLocalDateInTimezone(date, timezone) {
  try {
    // Use Intl API to get timezone-aware date
    const formatter = new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      timeZone: timezone,
    });

    const parts = formatter.formatToParts(date);
    const year = parseInt(parts.find((p) => p.type === 'year').value);
    const month = parseInt(parts.find((p) => p.type === 'month').value) - 1; // JS month is 0-indexed
    const day = parseInt(parts.find((p) => p.type === 'day').value);

    // Return a UTC date representing the local date
    return new Date(Date.UTC(year, month, day));
  } catch (error) {
    console.warn(`Invalid timezone "${timezone}", falling back to UTC`);
    return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
  }
}

/**
 * Get date range boundaries in a specific timezone
 * @param {string} dateKey - Date key in YYYY-MM-DD format
 * @param {string} timezone - IANA timezone string
 * @returns {object} Object with startTime and endTime as ISO strings (UTC)
 * @example
 * getDateRangeInTimezone('2026-02-28', 'America/New_York')
 * // {
 * //   startTime: '2026-02-28T05:00:00.000Z',  // 2026-02-28 00:00 EST
 * //   endTime: '2026-02-29T04:59:59.999Z'     // 2026-02-28 23:59 EST
 * // }
 */
function getDateRangeInTimezone(dateKey, timezone = 'UTC') {
  const [year, month, day] = dateKey.split('-').map(Number);

  // Create date at beginning of day in target timezone
  const localStartDate = new Date();
  localStartDate.setUTCFullYear(year, month - 1, day);
  localStartDate.setUTCHours(0, 0, 0, 0);

  // Convert to UTC time for the start of that local day
  const startTime = convertLocalToUTC(localStartDate, timezone);

  // End of day is 23:59:59.999 in local timezone
  const endTime = new Date(startTime);
  endTime.setHours(23, 59, 59, 999); // This sets hours in local time after conversion

  // More precise: add 24 hours and subtract 1ms
  const endTimePrecise = new Date(startTime.getTime() + 24 * 60 * 60 * 1000 - 1);

  return {
    startTime: startTime.toISOString(),
    endTime: endTimePrecise.toISOString(),
  };
}

/**
 * Convert a local time to UTC
 * Assumes dateObj has Date components that represent local time
 * @param {Date} dateObj - Date object with local time components
 * @param {string} timezone - IANA timezone string
 * @returns {Date} Date object in UTC
 */
function convertLocalToUTC(dateObj, timezone) {
  try {
    const formatter = new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      timeZone: timezone,
    });

    // Get UTC offset by checking formatter
    const utcDate = new Date(dateObj.toLocaleString('en-US', { timeZone: 'UTC' }));
    const localDate = new Date(dateObj.toLocaleString('en-US', { timeZone: timezone }));

    const offset = utcDate - localDate;
    return new Date(dateObj.getTime() + offset);
  } catch (error) {
    console.warn(`Error converting to UTC for timezone "${timezone}"`);
    return dateObj;
  }
}

/**
 * Get yesterday's date key in a specific timezone
 * @param {string} timezone - IANA timezone string
 * @returns {string} Yesterday's date key in YYYY-MM-DD format
 */
function getYesterdayKey(timezone = 'UTC') {
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  return normalizeDateKey(yesterday, timezone);
}

/**
 * Get date key for N days ago
 * @param {number} daysAgo - Number of days ago (0 = today, 1 = yesterday, etc)
 * @param {string} timezone - IANA timezone string
 * @returns {string} Date key in YYYY-MM-DD format
 */
function getDateKeyNDaysAgo(daysAgo, timezone = 'UTC') {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  return normalizeDateKey(date, timezone);
}

/**
 * Validate date key format
 * @param {string} dateKey - Date key string
 * @returns {boolean} True if valid YYYY-MM-DD format
 */
function isValidDateKey(dateKey) {
  return /^\d{4}-\d{2}-\d{2}$/.test(dateKey) && !isNaN(new Date(dateKey).getTime());
}

/**
 * Parse date key string to Date object (UTC start of day)
 * @param {string} dateKey - Date key in YYYY-MM-DD format
 * @returns {Date} Date object at 00:00:00 UTC
 */
function parseDateKey(dateKey) {
  const [year, month, day] = dateKey.split('-').map(Number);
  return new Date(Date.UTC(year, month - 1, day, 0, 0, 0, 0));
}

/**
 * Get date range between two date keys (inclusive)
 * @param {string} startKey - Start date in YYYY-MM-DD format
 * @param {string} endKey - End date in YYYY-MM-DD format
 * @returns {string[]} Array of date keys
 */
function getDateRange(startKey, endKey) {
  const dates = [];
  const current = new Date(startKey);
  const end = new Date(endKey);

  while (current <= end) {
    dates.push(current.toISOString().split('T')[0]);
    current.setDate(current.getDate() + 1);
  }

  return dates;
}

module.exports = {
  normalizeDateKey,
  getLocalDateInTimezone,
  getDateRangeInTimezone,
  convertLocalToUTC,
  getYesterdayKey,
  getDateKeyNDaysAgo,
  isValidDateKey,
  parseDateKey,
  getDateRange,
};
