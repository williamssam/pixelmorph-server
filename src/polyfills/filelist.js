class FileList {
	constructor() {
		this.length = 0
		this.files = []
	}

	addItem(file) {
		this.files.push(file)
		this.length++
	}

	item(index) {
		if (index < 0 || index >= this.length) {
			return null
		}
		return this.files[index]
	}
}

module.exports = FileList
