import { z } from 'zod'
import { imageFormat, losslessFormats, objectFit, objectPositions } from '../../utils/constants'

export const transformImageSchema = z.object({
	image: z.string({ required_error: 'Image is required' }),
	transformations: z.object({
		convert: z
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
					.catch(80),
				lossless: z.boolean().optional(),
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
					.enum(objectPositions, {
						required_error: `Resize Position can only be one of: "${objectPositions.join(
							', '
						)}"`,
					})
					.default('center'),
				object_fit: z
					.enum(objectFit, {
						required_error: `Resize Position can only be one of: "${objectFit.join(
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
				grayscale: z.boolean().or(z.literal(undefined)),
				// tint: z.string().co
			})
			.optional(),
	}),
})

export type TransformImageSchema = z.infer<typeof transformImageSchema.shape.transformations>
// export type TransformationsSchema = z.infer<typeof transformationsSchema>

// quality
// loseless (boolean: webp, jp2, avif, heif, jxl,)
// ;('/images?resize_width=100&resize_height=100&rotate=90&format=jpeg&filters_grayscale=true&filters_sepia=true')
