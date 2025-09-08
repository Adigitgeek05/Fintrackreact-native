import ratelimiter from "../config/upstash.js";

const rateLimiterMiddleware = async (req, res, next) => {
  try {

    //userid,ip address,api key
    const { success } = await ratelimiter.limit("my-rate-limiter");
    if (!success) {
      return res.status(429).json({ error: "Too many requests" });
    }

    next();
  } catch (error) {
    console.error("Rate limiting error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export default rateLimiterMiddleware;