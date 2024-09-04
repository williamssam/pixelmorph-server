import { zValidator } from '@hono/zod-validator'
import { Hono } from 'hono'
import { sign } from 'hono/jwt'
import { HttpStatusCode } from '../../utils/types'
import { authPayload } from './auth.schema'
import { createUser, findUser } from './auth.service'

const EXPIRE_AT = Math.floor(Date.now() / 1000) + 60 * 15 //15mins

const authRoutes = new Hono()

authRoutes
	.post('/register', zValidator('json', authPayload), async c => {
		const valid = c.req.valid('json')

		const user = await findUser({ username: valid.username })
		if (user) {
			return c.json(
				{ success: false, message: 'User with username already exists' },
				HttpStatusCode.CONFLICT
			)
		}

		const newUser = await createUser(valid)
		return c.json(
			{
				success: true,
				message: 'User created successfully',
				data: newUser,
			},
			HttpStatusCode.CREATED
		)
	})
	.post('/login', zValidator('json', authPayload), async c => {
		const valid = c.req.valid('json')

		const user = await findUser({ username: valid.username })
		if (!user) {
			return c.json(
				{ success: false, message: 'User with username does not exists' },
				HttpStatusCode.NOT_FOUND
			)
		}

		const validPassword = await Bun.password.verify(valid.password, user.password)
		if (!validPassword) {
			return c.json(
				{ success: false, message: 'Invalid username or password' },
				HttpStatusCode.BAD_REQUEST
			)
		}

		const token = await sign(
			{ username: user.username, id: user._id, exp: EXPIRE_AT },
			Bun.env['TOKEN_KEY'] as string
		)

		return c.json({
			success: true,
			message: 'User logged in successfully',
			data: {
				user,
				token,
			},
		})
	})

export default authRoutes
