import type { FilterQuery, ProjectionType, QueryOptions } from 'mongoose'
import type { UserDocument } from './auth.model'
import UserModel from './auth.model'

type UserInput = Pick<UserDocument, 'username' | 'password'>

export const createUser = (input: UserInput) => {
	return UserModel.create(input)
}

export const findUserById = (id: string) => {
	return UserModel.findById(id)
}

export const findUser = (
	query: FilterQuery<UserDocument>,
	projection: ProjectionType<UserDocument> = {},
	options: QueryOptions = {}
) => {
	return UserModel.findOne(query, projection, options)
}

export const deleteUser = (query: FilterQuery<UserDocument>) => {
	return UserModel.deleteOne(query)
}
