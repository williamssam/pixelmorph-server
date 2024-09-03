import { zValidator } from '@hono/zod-validator'
import { Hono } from 'hono'
import { transformImage } from './image.methods'
import { transformImageSchema } from './image.schema'

const imgRoutes = new Hono()
type Format = 'jpeg' | 'jpg' | 'jp2' | 'jxl' | 'png' | 'webp' | 'svg' | 'avif'

/*
 * Todo: Convert multiple image
 * What happens if ten people are converting at the same time. I think i should add queuing to this
 */
imgRoutes.post('/compress', zValidator('form', transformImageSchema), async c => {
	const formdata = await c.req.formData()

	const format = formdata.get('format') as Format
	const quality = formdata.get('quality') ?? 80
	const lossless = formdata.get('lossless')
	const images = formdata.getAll('image')

	let allImages = []
	for (let index = 0; index < images.length; index++) {
		const image = images[index]
		// @ts-expect-error
		const imageBuffer = Buffer.from(await image?.arrayBuffer())

		const transformedImage = await transformImage({
			input: imageBuffer,
			format,
			quality: Number(quality),
			lossless: Boolean(lossless),
		})

		// FIXME: What happens if there is an error
		if (!transformedImage) {
			return c.json({
				success: false,
				message: 'Error transforming image, please try again later',
			})
		}

		allImages.push(transformedImage)
	}

	return c.json({
		success: true,
		message: 'Image transformed successfully',
		data:allImages,
	})
})

export default imgRoutes
