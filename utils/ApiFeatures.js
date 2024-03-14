class ApiFeatures {
	constructor(query, queryString) {
		this.query = query;
		this.queryString = queryString;
	}

	filter() {
		let queryObject = {...this.queryString};
		const excludedFields = ['page', 'limit', 'sort', 'fields'];
		excludedFields.map(el => delete queryObject[el]);

		let queryStr = JSON.stringify(queryObject);
		queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, match => {
			return `$${match}`;
		});
		this.query = this.query.find(JSON.parse(queryStr));
		return this;
	}
	sort() {
		if (this.queryString.sort) {
			this.query = this.query.sort(this.queryString.sort.split(',').join(' '));
		} else {
			this.query = this.query.sort('-createdAt');
		}
		return this;
	}
	limitFields() {
		if (this.queryString.fields) {
			this.query = this.query.select(
				this.queryString.fields.split(',').join(' ')
			);
		} else {
			this.query = this.query.select('-__v');
		}
		return this;
	}
	pagination() {
		const page = this.queryString.page * 1 || 1;
		const limit = this.queryString.limit * 1 || 100;
		const skip = (page - 1) * limit;

		this.query = this.query.skip(skip).limit(limit);
		return this;
	}
}

module.exports = ApiFeatures;
