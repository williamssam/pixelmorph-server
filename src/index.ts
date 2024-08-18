import { Hono } from 'hono'
import { csrf } from 'hono/csrf'
import { logger } from 'hono/logger'
import { prettyJSON } from 'hono/pretty-json'
import mongoose from 'mongoose'
import authRoutes from './modules/auth/auth.routes'
import imgRoutes from './modules/images/image.routes'
import { connectToDB } from './utils/connect-db'

const app = new Hono()

// middlewares
app.use(csrf())
app.use(logger())
app.use(prettyJSON())

app.get('/api/v1/health-check', async c => {
	return c.text('OK')
})
app.route('/api/v1/auth', authRoutes)
app.route('/api/v1', imgRoutes)

// global error handling
app.notFound(async c => {
	return c.json(
		{
			success: false,
			message: `Route "${c.req.url}" with method: "${c.req.method}" does not exists`,
		},
		404
	)
})

// mongoose default to remove both "_id" and version number from response
mongoose.set('toJSON', {
	virtuals: true, // this will convert _id to id
	versionKey: false,
	transform: (doc, ret) => {
		ret._id = undefined
		ret.password = undefined

		return ret
	},
})
connectToDB()

export default {
	port: 4321,
	fetch: app.fetch,
}
