import { zValidator } from '@hono/zod-validator'
import { Hono } from 'hono'
import { transformImage } from './image.methods'
import { transformImageSchema } from './image.schema'

const imgRoutes = new Hono()

/*
 * Todo: Convert to multiple formats
 * Todo: Convert multiple image
 */
imgRoutes.post('/transform', zValidator('json', transformImageSchema), async c => {
	const valid = c.req.valid('json')
	// console.log('valid', body)

	const image = valid.image.split(';base64,')[1]
	const input = Buffer.from(image, 'base64')
	const transformedImage = await transformImage({
		input: input,
		format: valid.transformations.convert.format,
		quality: valid.transformations.convert.quality,
		lossless: valid.transformations.convert.lossless,
	})

	if (!transformedImage) {
		return c.json({
			success: false,
			message: 'Error transforming image, please try again later',
		})
	}

	const base64 = `data:image/${
		valid.transformations.convert.format
	};base64,${transformedImage.data.toString('base64')}`

	return c.json({
		success: true,
		message: 'Image transformed successfully',
		data: {
			image: base64,
			new_metadata: {
				width: transformedImage.info.width,
				height: transformedImage.info.height,
				size: transformedImage.info.size,
				format: transformedImage.info.format,
			},
			old_metadata: {
				width: transformedImage.metadata.width,
				height: transformedImage.metadata.height,
				size: transformedImage.metadata.size,
				format: transformedImage.metadata.format,
			},
		},
	})
})

export default imgRoutes
