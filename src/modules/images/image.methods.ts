import sharp from 'sharp'
import type { z } from 'zod'
import type { transformImageSchema } from './image.schema'

type ImageTransform = z.infer<typeof transformImageSchema>
interface TransformImagePayload extends ImageTransform {
	image: Buffer | Uint8Array
}

export const transformImage = async (payload: TransformImagePayload) => {
	try {
		let transformer = sharp(payload.image).toFormat(payload.format, {
			quality: payload.quality ?? 80,
			...(payload.lossless ? { lossless: payload.lossless } : {}),
		})

		if (payload.resize) {
			transformer = transformer.resize({
				width: payload.resize?.width,
				height: payload.resize?.height,
			})
		}

		if (payload.grayscale) {
			transformer = transformer.grayscale()
		}

		if (payload.rotate) {
			transformer = transformer.rotate(payload.rotate)
		}

		/**
		 * Gets metadata of uncompressed/unconverted image
		 **/
		const metadata = await transformer.metadata()
		const { data, info } = await transformer.toBuffer({ resolveWithObject: true })
		const imageBase64 = `data:image/${info.format};base64,${data.toString('base64')}`

		return {
			image: imageBase64,
			new_metadata: {
				width: info.width,
				height: info.height,
				size: info.size,
				format: info.format,
			},
			old_metadata: {
				width: metadata.width,
				height: metadata.height,
				size: metadata.size,
				format: metadata.format,
			},
		}
	} catch (error) {
		if (error instanceof Error) {
			console.log('Error transforming image', error)
		}
	}
}
