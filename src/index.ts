import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { logger } from 'hono/logger'
import { prettyJSON } from 'hono/pretty-json'
import mongoose from 'mongoose'
import './compress-polyfill'
import authRoutes from './modules/auth/auth.routes'
import compressRoute from './modules/compress/compress.routes'
import imgRoute from './modules/images/image.routes'
import { connectToDB } from './utils/connect-db'

const app = new Hono()

// middlewares
app.use(cors())
app.use(logger())
app.use(prettyJSON())

app.get('/api/v1/health-check', async c => {
	return c.text('OK')
})
app.route('/api/v1/auth', authRoutes)
app.route('/api/v1', imgRoute)
app.route('/api/v1', compressRoute)

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
	maxRequestBodySize: 200_000_000_000,
}
