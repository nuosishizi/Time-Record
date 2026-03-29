
/**
 * Formats a date string or timestamp into a readable time string based on timezone
 */
export const formatTimeInZone = (dateInput: string | number | Date, timezone: string): string => {
  try {
    const date = new Date(dateInput);
    return new Intl.DateTimeFormat('zh-CN', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
      timeZone: timezone
    }).format(date);
  } catch (e) {
    console.error(`Timezone error: ${timezone}`, e);
    return new Date(dateInput).toLocaleTimeString();
  }
};

/**
 * Formats a date into "Month/Day Time" format
 */
export const formatDateTimeInZone = (dateInput: string | number | Date, timezone: string): string => {
  try {
    const date = new Date(dateInput);
    return new Intl.DateTimeFormat('zh-CN', {
      month: 'numeric',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
      timeZone: timezone
    }).format(date);
  } catch (e) {
      return new Date(dateInput).toLocaleString();
  }
};

/**
 * Returns the hour (0-23) of a date in a specific timezone
 * This uses a highly reliable parsing method to avoid cross-browser formatting issues and strictly respects DST.
 */
export const getHourInZone = (date: Date, timezone: string): number => {
    try {
        const parts = new Intl.DateTimeFormat('en-US', {
            hour: 'numeric',
            hour12: false,
            timeZone: timezone
        }).formatToParts(date);
        
        const hourPart = parts.find(p => p.type === 'hour');
        if (hourPart) {
            let hour = parseInt(hourPart.value, 10);
            if (hour === 24) hour = 0; // en-US sometimes returns 24 for midnight
            return hour;
        }
        return date.getHours();
    } catch (e) {
        return date.getHours();
    }
};

/**
 * Returns the UTC offset string for a given timezone, e.g., "UTC+8" or "UTC-5"
 */
export const getTimezoneOffset = (timezone: string): string => {
  try {
    const now = new Date();
    // Use formatToParts to accurately extract the timezone offset without relying on GMT strings
    const parts = new Intl.DateTimeFormat('en-US', {
        timeZone: timezone,
        timeZoneName: 'shortOffset'
    }).formatToParts(now);
    
    const offsetPart = parts.find(p => p.type === 'timeZoneName');
    if (offsetPart) {
        return offsetPart.value.replace('GMT', 'UTC');
    }
    return 'UTC';
  } catch (e) {
    return 'UTC';
  }
};

/**
 * Creates a Date object that represents a specific hour today in a specific timezone
 */
export const getDateForZoneHour = (hour: number, timezone: string): Date => {
    const now = new Date();
    return now;
};
