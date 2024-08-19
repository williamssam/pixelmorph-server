import { zValidator } from '@hono/zod-validator'
import { Hono } from 'hono'
import { transformImageSchema } from './image.schema'

const imgRoutes = new Hono()

imgRoutes.post('/transform', zValidator('json', transformImageSchema), async c => {
	const valid = c.req.valid('json')
	// if (!valid) {
	// 	console.log('invalid', c.req)
	// }

	// const transformedImage = await transformImage(file)
	// console.log(file)

	return c.json({
		success: true,
		message: 'Image transformed successfully',
		// data: transformedImage,
	})
})

export default imgRoutes
