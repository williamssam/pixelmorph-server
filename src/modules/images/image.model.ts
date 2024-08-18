import mongoose from 'mongoose'

const imagesModel = new mongoose.Schema(
	{
		image: {
			type: Buffer,
			required: true,
		},
		client: {
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

const ImageModel = mongoose.model('Image', imagesModel)
export default ImageModel
