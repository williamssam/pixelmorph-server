import { Hono } from 'hono'

const imgRoutes = new Hono()

imgRoutes.get('/images', async c => {
	return c.text('OK')
})

export default imgRoutes
