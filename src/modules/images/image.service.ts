import type { UserDocument } from '../user/user.model'
import type { ImageDocument } from './image.model'
import ImageModel from './image.model'

type ImageInput = Pick<ImageDocument, 'image' | 'format' | 'original_name' | 'size' | 'user'>

export const createImage = (input: ImageInput) => {
	return ImageModel.create(input)
}

export const findImageById = (id: string) => {
	return ImageModel.findById(id)
}

type GetAllImageInput = {
	limit: number
	skip: number
	id: string
}
export const getAllImages = ({ limit, skip, id }: GetAllImageInput) => {
	return ImageModel.find({ user: id }).limit(limit).skip(skip).sort({ created_at: -1 })
}

export const totalUserImages = (id: UserDocument['id']) => {
	return ImageModel.countDocuments({
		user_id: id,
	})
}

export const deleteImage = (id: string) => {
	return ImageModel.findByIdAndDelete(id)
}
