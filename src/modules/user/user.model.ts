import mongoose from 'mongoose'

export interface UserDocument extends mongoose.Document {
	username: string
	password: string
}

const userSchema = new mongoose.Schema(
	{
		username: {
			type: String,
			required: true,
		},
		password: {
			type: String,
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

userSchema.pre('save', async function (next) {
	try {
		if (!this.isModified('password')) {
			next()
		}

		const hash = await Bun.password.hash(this.password, {
			algorithm: 'bcrypt',
			cost: 4,
		})
		this.password = hash
		next()
	} catch (error) {
		next()
	}
})

const UserModel = mongoose.model<UserDocument>('User', userSchema)
export default UserModel
