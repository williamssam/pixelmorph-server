import { Hono } from 'hono'
import { csrf } from 'hono/csrf'
import { logger } from 'hono/logger'
import { prettyJSON } from 'hono/pretty-json'

const app = new Hono()

// middlewares
app.use(csrf())
app.use(logger())
app.use(prettyJSON())

// global error handling
app.notFound(async c => {
	return c.json({ success: false, message: `Route "${c.req.url}" does not exists` }, 404)
})

app.get('/', async c => {
	return c.text('Hello Hono!')
})

export default app
