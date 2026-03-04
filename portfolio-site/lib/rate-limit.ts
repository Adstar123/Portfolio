interface RateLimitEntry {
  timestamps: number[];
}

const ipMap = new Map<string, RateLimitEntry>();

const WINDOW_MS = 60 * 60 * 1000; // 1 hour
const MAX_REQUESTS = 5;

// Clean up stale entries every 10 minutes
setInterval(() => {
  const now = Date.now();
  for (const [ip, entry] of ipMap) {
    entry.timestamps = entry.timestamps.filter((t) => now - t < WINDOW_MS);
    if (entry.timestamps.length === 0) {
      ipMap.delete(ip);
    }
  }
}, 10 * 60 * 1000);

export function rateLimit(ip: string): { success: boolean } {
  const now = Date.now();
  const entry = ipMap.get(ip) ?? { timestamps: [] };

  // Remove timestamps outside the window
  entry.timestamps = entry.timestamps.filter((t) => now - t < WINDOW_MS);

  if (entry.timestamps.length >= MAX_REQUESTS) {
    return { success: false };
  }

  entry.timestamps.push(now);
  ipMap.set(ip, entry);
  return { success: true };
}
