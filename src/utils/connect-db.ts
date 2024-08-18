import mongoose from 'mongoose'

export const connectToDB = async () => {
	try {
		await mongoose.connect(Bun.env['MONGO_URI'] as string)
		console.log('Connected to DB')
	} catch (error) {
		console.error('Could not connect to DB', error)
		process.exit(1)
	}
}
