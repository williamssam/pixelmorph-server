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
			type: Buffer,
			required: true,
			set: (val: any) => {
				if (typeof val === 'string') {
					const rawBase64 = val.replace(/^data:image\/\w+;base64,/, '')
					return Buffer.from(rawBase64, 'base64')
				}
				return val
			},
		},
		format: {
			type: String,
			required: true,
		},
		size: {
			type: Number,
			required: true,
		},
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
