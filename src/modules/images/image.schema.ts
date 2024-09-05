import { isObjectIdOrHexString } from 'mongoose'
import { z } from 'zod'
import { imageFormat, losslessFormats } from '../../utils/constants'

export const uploadImageSchema = z.object({
	image: z.instanceof(File).array().or(z.instanceof(File)),
})

export const getImageSchema = z.object({
	id: z
		.string({
			required_error: 'Invoice ID is required',
		})
		.trim()
		.refine(val => isObjectIdOrHexString(val), {
			message: 'Invalid Image ID',
		}),
})

export const getAllImageSchema = z.object({
	limit: z.coerce
		.number()
		.positive()
		.min(5, 'Limit cannot be less than 5')
		.max(100, 'Limit cannot be more than 100')
		.catch(15),
	page: z.coerce
		.number({
			required_error: 'Page is required',
		})
		.positive('Page must be a positive number')
		.catch(1),
	// user: z
	// 	.string({
	// 		required_error: 'Invoice ID is required',
	// 	})
	// 	.trim()
	// 	.refine(val => isObjectIdOrHexString(val), {
	// 		message: 'Invalid Invoice ID',
	// 	}),
})

export const transformImageSchema = z
	.object({
		format: z.enum(imageFormat, {
			required_error: `Image format can only be one of: ${imageFormat.join(', ')}`,
		}),
		quality: z
			.number({
				required_error: 'Image Quality is required',
			})
			.positive()
			.gte(1, 'Quality must be between 1 and 100')
			.lte(100, 'Quality must be between 1 and 100')
			.default(80),
		lossless: z.boolean().optional(),
		resize: z
			.object({
				width: z
					.number({
						required_error: 'Resize Width is required',
					})
					.positive('Width must be positive number'),
				height: z
					.number({
						required_error: 'Resize Height is required',
					})
					.positive('Height must be positive number'),
			})
			.optional(),
		rotate: z
			.number({
				required_error: 'Rotate angle is required',
			})
			.or(z.literal(undefined)),
		grayscale: z.boolean().or(z.literal(undefined)),
	})
	.superRefine((val, ctx) => {
		if (String(val.lossless) && !losslessFormats.includes(val.format)) {
			ctx.addIssue({
				code: z.ZodIssueCode.custom,
				message: `Image format must be one of: "${losslessFormats.join(
					', '
				)}" to be lossless`,
			})
		}

		if (val.resize?.width && !val.resize?.height) {
			ctx.addIssue({
				code: z.ZodIssueCode.custom,
				message: 'Resize height is required when resize width is provided',
			})
		}

		if (val.resize?.height && !val.resize?.width) {
			ctx.addIssue({
				code: z.ZodIssueCode.custom,
				message: 'Resize width is required when resize height is provided',
			})
		}
	})
