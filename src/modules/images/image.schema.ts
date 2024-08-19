import { z } from 'zod'

const acceptedImageTypes = [
	'image/jpeg',
	'image/jpg',
	'image/png',
	'image/webp',
	'image/gif',
	'image/svg+xml',
	'image/avif',
	'image/heic',
] as const

const image_types = acceptedImageTypes.map(type => type.split('/')[1])
const lossless_formats = ['png', 'webp', 'avif', 'heic']
const object_fit = ['contain', 'cover', 'fill', 'inside', 'outside'] as const
const object_positions = [
	'top',
	'bottom',
	'left',
	'right',
	'center',
	'right top',
	'right bottom',
	'left top',
	'left bottom',
] as const

export const transformImageSchema = z.object({
	// file: z.instanceof(Buffer),
	transformations: z.object({
		/**Convert to 8-bit greyscale; 256 shades of grey.*/
		image: z
			.object({
				format: z
					.string({
						required_error: 'Image format to transform to is required',
					})
					.refine(val => image_types.includes(val), {
						message: `Invalid image type, ${image_types.join(
							', '
						)} only  are supported`,
					}),
				quality: z
					.number({
						required_error: 'Image Quality is required',
					})
					.positive()
					.gte(1, 'Quality must be between 1 and 100')
					.lte(100, 'Quality must be between 1 and 100'),
				lossless: z.boolean().optional(),
			})
			.superRefine((val, ctx) => {
				if (String(val.lossless) && !lossless_formats.includes(val.format)) {
					ctx.addIssue({
						code: z.ZodIssueCode.custom,
						message: `Image format must be one of: "${lossless_formats.join(
							', '
						)}" to be lossless`,
					})
				}
			}),
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
				object_position: z
					.enum(object_positions, {
						required_error: `Resize Position can only be one of: "${object_positions.join(
							', '
						)}"`,
					})
					.default('center'),
				object_fit: z
					.enum(object_fit, {
						required_error: `Resize Position can only be one of: "${object_fit.join(
							', '
						)}"`,
					})
					.default('cover'),
			})
			.optional(),
		rotate: z
			.number({
				required_error: 'Rotate angle is required',
			})
			.or(z.literal(undefined)),
		crop: z
			.object({
				width: z.number({
					required_error: 'Crop width is required',
				}),
				height: z.number({
					required_error: 'Crop height is required',
				}),
				left: z.number({
					required_error: 'Crop x (horizontal) coordinate is required',
				}),
				top: z.number({
					required_error: 'Crop y (vertical) coordinate is required',
				}),
			})
			.optional(),
		filters: z
			.object({
				/**
				 * Convert to 8-bit greyscale; 256 shades of grey.
				 */
				grayscale: z.boolean().or(z.literal(undefined)),
				// tint: z.string().co
			})
			.optional(),
	}),
})

// type TransformImageSchema = z.infer<typeof transformImageSchema>

// quality
// loseless (boolean: webp, jp2, avif, heif, jxl,)
// ;('/images?resize_width=100&resize_height=100&rotate=90&format=jpeg&filters_grayscale=true&filters_sepia=true')
