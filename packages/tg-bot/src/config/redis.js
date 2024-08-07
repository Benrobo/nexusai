import Redis from "ioredis";

const connString = process.env.REDIS_URL || "redis://localhost:6379";

const redis = new Redis(connString, {
  maxRetriesPerRequest: null,
});

redis.on("error", (err) => {
  if (err.message.includes("MaxRetriesPerRequestError")) {
    // Handle or ignore this specific error
  } else {
    console.error("Redis error:", err);
  }
});

export default redis;
