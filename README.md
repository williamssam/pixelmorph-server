# PixelMorph

This is an image processing service similar to [Cloudinary](https://cloudinary.com/). The service will allow users to upload images, perform various transformations (with and without logging in), and retrieve images in different formats.

The system feature
	- user authentication
	- image upload
	- transformation operations

## To install dependencies:

```sh
bun install
```

To run:

```sh
bun run dev
```

open http://localhost:3000


## Tech Stack
- Bun
- Hono
- Sharp (for fast image transformations)
- Mongodb/Mongoose
- Zod for validation

## Features
- Request are rate limited for each ip address to prevent abuse
- (soon) Cache transformed images to improve performance
- Transform images without creating an account

### Authentication endpoints
|  Name 	|  Path 	|  Method 	|  Query 	|   	|
|---	|---	|---	|---	|---	|
| Register  	|  **/register** 	|  POST 	|  - 	|   	|
| Login 	|  **/login** 	|  POST 	|  - 	|   	|

### Images endpoints
|  Name 	|  Path 	|  Method 	|  Query 	|  Params  	|
|---	|---	|---	|---	|---	|
| Compress (without creating an account)  	|  **/compress** 	|  POST 	|  - 	|   	|
| Upload image 	|  **/images** 	|  POST 	|  - 	|   	|
| List all images 	|  **/images** 	|  POST 	|  page,limit 	|   	|
| Retrieve image 	|  **/images/:id** 	|  POST 	|  - 	|  image id	|
| Delete image 	|  **/images/:id** 	|  DELETE 	|  - 	|  image id	|
| Transform image 	|  **/images/:id/transform** 	|  POST 	|  - 	|  image id	|

## Gotcha
- Storing images as base64 in our mongodb database. (note: mongodb collection has a 16mb limit). Another option I might explore is to store this images in GridFS or Cloudinary.

## Challenge
https://roadmap.sh/projects/image-processing-service