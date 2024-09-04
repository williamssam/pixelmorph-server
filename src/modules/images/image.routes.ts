import { zValidator } from '@hono/zod-validator'
import { Hono } from 'hono'
import { jwt, verify } from 'hono/jwt'
import { limiter } from '../../utils/helper'
import { HttpStatusCode } from '../../utils/types'
import { findUserById } from '../auth/auth.service'
import { transformImage } from './image.methods'
import {
	getAllImageSchema,
	getImageSchema,
	transformImageSchema,
	uploadImageSchema,
} from './image.schema'
import { createImage, findImageById, getAllImages } from './image.service'

const imgRoute = new Hono()
// type Format = 'jpeg' | 'jpg' | 'jp2' | 'jxl' | 'png' | 'webp' | 'svg' | 'avif'

// middlewares
imgRoute.use('*', limiter, async (c, next) => {
	if (c.res.status === HttpStatusCode.TOO_MANY_REQUESTS) {
		return c.json(
			{
				success: false,
				message: 'Too many requests, please try again later',
				data: null,
			},
			HttpStatusCode.TOO_MANY_REQUESTS
		)
	}

	return await next()
})
imgRoute
	.use('*', jwt({ secret: Bun.env['TOKEN_KEY'] as string }))
	.use('*', async (c, next) => {
		const token = c.req.header('Authorization')?.replace('Bearer ', '')

		const payload = await verify(token as string, Bun.env['TOKEN_KEY'] as string)
		if (!payload) {
			return c.json(
				{
					success: false,
					message: 'Invalid or expired token!',
					data: null,
				},
				HttpStatusCode.UNAUTHORIZED
			)
		}

		// @ts-expect-error
		const user = await findUserById(payload?.id)
		if (!user) {
			return c.json(
				{
					success: false,
					message: 'User does not exist!',
					data: null,
				},
				HttpStatusCode.UNAUTHORIZED
			)
		}

		return await next()
	})
	.post('/images', zValidator('form', uploadImageSchema), async c => {
		const formdata = await c.req.formData()

		const images = formdata.getAll('image')

		for (let index = 0; index < images.length; index++) {
			const image = images[index] as unknown as File

			const size = image.size
			const format = image.type
			const original_name = image.name
			// @ts-expect-error
			const imageBuffer = Buffer.from(await image?.arrayBuffer(), 'base64').toString('ascii')

			await createImage({
				image: imageBuffer,
				size,
				format,
				original_name,
			})
		}

		// add to database
		return c.json({
			success: true,
			message: 'Image(S) uploaded successfully!',
		})
	})
	.get('/images/:id', zValidator('param', getImageSchema), async c => {
		const { id } = c.req.valid('param')
		const image = await findImageById(id)

		if (!image) {
			return c.json(
				{ success: false, message: 'Image with id does not exists' },
				HttpStatusCode.CONFLICT
			)
		}

		return c.json({ success: true, message: 'Image fetched successfully', data: image })
	})
	.get(
		'/images',
		zValidator('query', getAllImageSchema),
		jwt({
			secret: Bun.env['TOKEN_KEY'],
		}),
		async c => {
			const { limit: requestedLimit, page: requestedPage } = c.req.valid('query')

			// const user = await findUserById(user)
			// if(!user) {
			// 	return c.json({ success: false, message: 'User with id does not exists' }, HttpStatusCode.NOT_FOUND)
			// }

			const page = Number(requestedPage) || 1
			const limit = Number(requestedLimit) || 15
			const skip = (page - 1) * limit

			const images = await getAllImages({ limit, skip })
			// const total = await countInvoice(user_id)

			return c.json({
				success: true,
				message: 'Images fetched successfully!',
				data: images,
				meta: {
					// total,
					current_page: page,
					per_page: limit,
					// total_pages: Math.ceil(total / limit) || 1,
					// has_next_page: page < Math.ceil(total / limit),
				},
			})
		}
	)
	.post(
		'/images/:id/transform',
		zValidator('param', getImageSchema),
		zValidator('json', transformImageSchema),
		async c => {
			const { id } = c.req.valid('param')
			const data = c.req.valid('json')

			const image = await findImageById(id)
			if (!image) {
				return c.json({
					success: false,
					message: 'Image with id does not exists',
				})
			}

			const base64Image = image.image.replace(/^data:image\/\w+;base64,/, '')
			const transformedImage = await transformImage({
				image: Buffer.from(base64Image, 'base64'),
				format: data.format,
				quality: data.quality,
				lossless: data.lossless,
				resize: data.resize,
				grayscale: data.grayscale,
				rotate: data.rotate,
			})

			return c.json({
				success: true,
				message: 'Image transformed successfully!',
				data: transformedImage,
			})
		}
	)

export default imgRoute
