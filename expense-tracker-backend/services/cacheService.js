const redis = require("redis");

class CacheService {
  constructor() {
    this.client = null;
    this.isConnected = false;
    this.defaultTTL = 300; // 5 minutes default
  }

  async connect() {
    try {
      const redisUrl = process.env.REDIS_URL || "redis://localhost:6379";

      this.client = redis.createClient({
        url: redisUrl,
        socket: {
          reconnectStrategy: (retries) => {
            if (retries > 3) {
              console.log("Redis: Max reconnection attempts reached");
              return false;
            }
            return Math.min(retries * 100, 3000);
          },
        },
      });

      this.client.on("error", (err) => {
        console.log("Redis Client Error:", err.message);
        this.isConnected = false;
      });

      this.client.on("connect", () => {
        console.log("Redis: Connected");
        this.isConnected = true;
      });

      this.client.on("disconnect", () => {
        console.log("Redis: Disconnected");
        this.isConnected = false;
      });

      await this.client.connect();
    } catch (error) {
      console.log("Redis: Connection failed, running without cache");
      this.isConnected = false;
    }
  }

  async get(key) {
    if (!this.isConnected) return null;

    try {
      const data = await this.client.get(key);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.log("Redis GET error:", error.message);
      return null;
    }
  }

  async set(key, value, ttl = this.defaultTTL) {
    if (!this.isConnected) return false;

    try {
      await this.client.setEx(key, ttl, JSON.stringify(value));
      return true;
    } catch (error) {
      console.log("Redis SET error:", error.message);
      return false;
    }
  }

  async del(key) {
    if (!this.isConnected) return false;

    try {
      await this.client.del(key);
      return true;
    } catch (error) {
      console.log("Redis DEL error:", error.message);
      return false;
    }
  }

  async delPattern(pattern) {
    if (!this.isConnected) return false;

    try {
      const keys = await this.client.keys(pattern);
      if (keys.length > 0) {
        await this.client.del(keys);
      }
      return true;
    } catch (error) {
      console.log("Redis DEL pattern error:", error.message);
      return false;
    }
  }

  async flush() {
    if (!this.isConnected) return false;

    try {
      await this.client.flushAll();
      return true;
    } catch (error) {
      console.log("Redis FLUSH error:", error.message);
      return false;
    }
  }

  generateKey(...parts) {
    return parts.join(":");
  }
}

const cacheService = new CacheService();

module.exports = cacheService;
