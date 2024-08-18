import { z } from 'zod'

export const authPayload = z.object({
	username: z
		.string({
			required_error: 'Username is required',
		})
		.min(3, {
			message: 'Username must be at least 3 characters',
		}),
	password: z
		.string({
			required_error: 'Password is required',
		})
		.min(6, {
			message: 'Password must be at least 6 characters',
		}),
})
