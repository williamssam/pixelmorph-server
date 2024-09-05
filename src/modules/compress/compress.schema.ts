import { z } from 'zod'
import { imageFormat, losslessFormats } from '../../utils/constants'

export const compressImageSchema = z
	.object({
		image: z.instanceof(File).array().or(z.instanceof(File)),
		format: z.enum(imageFormat, {
			required_error: `Image format can only be one of: ${imageFormat.join(', ')}`,
		}),
		quality: z.coerce
			.number({
				required_error: 'Image Quality is required',
			})
			.positive()
			.gte(1, 'Quality must be between 1 and 100')
			.lte(100, 'Quality must be between 1 and 100')
			.default(80),
		lossless: z.boolean().optional(),
		resize_width: z.coerce
			.number({
				errorMap: (issue, { defaultError }) => ({
					message:
						issue.code === 'invalid_type'
							? 'Resize width can only be number'
							: defaultError,
				}),
			})
			.positive('Width must be positive number')
			.optional(),
		resize_height: z.coerce
			.number({
				// required_error: 'Resize Height is required',
				errorMap: (issue, { defaultError }) => ({
					message:
						issue.code === 'invalid_type'
							? 'Resize height can only be number'
							: defaultError,
				}),
			})
			.positive('Height must be positive number')
			.optional(),
		rotate: z
			.number({
				required_error: 'Rotate angle is required',
			})
			.optional(),
		grayscale: z.coerce
			.string({
				errorMap: (issue, { defaultError }) => ({
					message:
						issue.code === 'invalid_type'
							? 'Grayscale can only be boolean (true or false)'
							: defaultError,
				}),
			})
			.optional(),
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

		if (val.resize_height && !val.resize_width) {
			ctx.addIssue({
				code: z.ZodIssueCode.custom,
				message: 'Resize width is required when resize height is provided',
			})
		}

		if (val.resize_width && !val.resize_height) {
			ctx.addIssue({
				code: z.ZodIssueCode.custom,
				message: 'Resize height is required when resize width is provided',
			})
		}
	})
