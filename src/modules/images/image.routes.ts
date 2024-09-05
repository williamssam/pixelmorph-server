import { zValidator } from '@hono/zod-validator'
import { Hono } from 'hono'
import { decode, jwt, verify } from 'hono/jwt'
import { limiter } from '../../utils/helper'
import { HttpStatusCode } from '../../utils/types'
import { findUserById } from '../user/user.service'
import { transformImage } from './image.methods'
import {
	getAllImageSchema,
	getImageSchema,
	transformImageSchema,
	uploadImageSchema,
} from './image.schema'
import {
	createImage,
	deleteImage,
	findImageById,
	getAllImages,
	totalUserImages,
} from './image.service'

const imgRoute = new Hono()

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
		const token = c.req.header('Authorization')?.replace('Bearer ', '') as string
		const { payload } = decode(token)

		const formdata = await c.req.formData()
		const images = formdata.getAll('image')

		const createdImages = []
		for (let index = 0; index < images.length; index++) {
			const image = images[index] as unknown as File

			const size = image.size
			const format = image.type
			const original_name = image.name
			// @ts-expect-error
			const imageBuffer = Buffer.from(await image?.arrayBuffer(), 'base64').toString('ascii')

			const newImage = await createImage({
				image: imageBuffer,
				size,
				format,
				original_name,
				user: payload?.id as string,
			})

			createdImages.push(newImage)
		}

		// add to database
		return c.json({
			success: true,
			message: 'Image(s) uploaded successfully!',
			data: createdImages,
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

		const token = c.req.header('Authorization')?.replace('Bearer ', '') as string
		const { payload } = decode(token)
		if (payload.id !== image.user.toString()) {
			return c.json({
				success: false,
				message: 'You are not authorized to perform this action',
			})
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

			const token = c.req.header('Authorization')?.replace('Bearer ', '') as string
			const { payload } = decode(token)

			const page = Number(requestedPage) || 1
			const limit = Number(requestedLimit) || 15
			const skip = (page - 1) * limit

			const images = await getAllImages({ limit, skip, id: String(payload?.id) })
			const total = await totalUserImages(payload?.id)

			return c.json({
				success: true,
				message: 'Images fetched successfully!',
				data: images,
				meta: {
					total,
					current_page: page,
					per_page: limit,
					total_pages: Math.ceil(total / limit) || 1,
					has_next_page: page < Math.ceil(total / limit),
					has_previous_page: page > 1,
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

			const token = c.req.header('Authorization')?.replace('Bearer ', '') as string
			const { payload } = decode(token)
			if (payload.id !== image.user.toString()) {
				return c.json({
					success: false,
					message: 'You are not authorized to perform this action',
				})
			}

			const imageBuffer = Buffer.from(image.image, 'base64url')
			console.log(imageBuffer)
			// const base64Image = image.image.replace(/^data:image\/\w+;base64,/, '')
			const transformedImage = await transformImage({
				image: imageBuffer,
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
	.delete('/images/:id', zValidator('param', getImageSchema), async c => {
		const { id } = c.req.valid('param')

		const image = await findImageById(id)
		if (!image) {
			return c.json({
				success: false,
				message: 'Image with id does not exists',
			})
		}

		const token = c.req.header('Authorization')?.replace('Bearer ', '') as string
		const { payload } = decode(token)
		if (payload.id !== image.user.toString()) {
			return c.json({
				success: false,
				message: 'You are not authorized to perform this action',
			})
		}

		await deleteImage(id)
		return c.json({ success: true, message: 'Image deleted successfully!' })
	})

export default imgRoute
