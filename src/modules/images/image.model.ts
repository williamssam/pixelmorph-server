import mongoose from 'mongoose'

export interface ImageDocument extends mongoose.Document {
	_id: string
	image: string
	format: string
	size: number
	user: string
	original_name: string
	created_at: Date
	updated_at: Date
}

const imagesModel = new mongoose.Schema(
	{
		image: {
			type: String,
			required: true,
		},
		format: String,
		size: Number,
		original_name: String,
		user: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'User',
			required: true,
		},
	},
	{
		timestamps: {
			createdAt: 'created_at',
			updatedAt: 'updated_at',
		},
	}
)

const ImageModel = mongoose.model<ImageDocument>('Image', imagesModel)

export default ImageModel
