import { zValidator } from '@hono/zod-validator'
import { Hono } from 'hono'
import type { imageFormat } from '../../utils/constants'
import { limiter } from '../../utils/helper'
import { transformImage } from '../images/image.methods'
import { compressImageSchema } from '../images/image.schema'

const compressRoute = new Hono()
type Format = (typeof imageFormat)[number]

compressRoute.post('/compress', limiter, zValidator('form', compressImageSchema), async c => {
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
			image: imageBuffer,
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
		data: allImages,
	})
})

export default compressRoute
