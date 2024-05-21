import Redis from "ioredis";

const connString = process.env.REDIS_URL || "redis://localhost:6379";

const redis = new Redis(connString);

export default redis;
