const imageFormat = ['jpeg', 'jpg', 'jp2', 'jxl', 'png', 'webp', 'avif'] as const
const losslessFormats = ['webp', 'avif', 'jxl', 'jp2']
const objectFit = ['contain', 'cover', 'fill', 'inside', 'outside'] as const
const objectPositions = [
	'top',
	'bottom',
	'left',
	'right',
	'center',
	'right top',
	'right bottom',
	'left top',
	'left bottom',
] as const

export { imageFormat, losslessFormats, objectFit, objectPositions }
