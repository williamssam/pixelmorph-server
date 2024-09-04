import { rateLimiter } from 'hono-rate-limiter'
import { nanoid } from 'nanoid'

export const limiter = rateLimiter({
	windowMs: 15 * 60 * 1000, // 15 minutes
	limit: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes).
	standardHeaders: 'draft-6',
	keyGenerator: () => nanoid(),
})
