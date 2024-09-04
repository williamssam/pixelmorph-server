import type { UserDocument } from '../auth/auth.model'
import type { ImageDocument } from './image.model'
import ImageModel from './image.model'

type ImageInput = Pick<ImageDocument, 'image' | 'format' | 'original_name' | 'size'>

export const createImage = (input: ImageInput) => {
	return ImageModel.create(input)
}

export const findImageById = (id: string) => {
	return ImageModel.findById(id)
}

type GetAllImageInput = {
	limit: number
	skip: number
}
export const getAllImages = ({ limit, skip }: GetAllImageInput) => {
	return ImageModel.find({}).limit(limit).skip(skip).sort({ created_at: -1 })
}

export const countInvoice = (id: UserDocument['id']) => {
	return ImageModel.countDocuments({
		$and: [{ user_id: id }],
	})
}
