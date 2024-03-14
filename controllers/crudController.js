const ApiFeatures = require('../utils/ApiFeatures');
const AppError = require('../utils/AppError');
const {catchAsync} = require('../utils/catchAsync');

exports.getAll = Model =>
	catchAsync(async (req, res, next) => {
		let filter = {};
		if (req.params.tourId) filter = {tour: req.params.tourId};
		const features = new ApiFeatures(Model.find(filter), req.query)
			.filter()
			.sort()
			.limitFields()
			.pagination();

		const doc = await features.query;
		// const doc = await features.query.explain();
		res.status(200).json({
			status: 'success',
			results: doc.length,
			data: {
				doc
			}
		});
	});

exports.getOneDoc = (Model, popOptions) =>
	catchAsync(async (req, res, next) => {
		const {id} = req.params;
		let query = Model.findById(id);
		if (popOptions) query = query.populate(popOptions);
		const doc = await query;

		if (!doc) {
			return next(new AppError(`There is no doc with this id ${id}`, 404));
		}
		res.status(200).json({
			status: 'success',
			data: doc
		});
	});
exports.deleteOne = Model =>
	catchAsync(async (req, res, next) => {
		const {id} = req.params;
		const doc = await Model.findByIdAndDelete(id);
		if (!doc) {
			return next(new AppError(`There is no doc with this id ${id}`, 404));
		}
		res.status(204).json({
			status: 'success',
			data: null
		});
	});
exports.createOne = Model =>
	catchAsync(async (req, res, next) => {
		const doc = await Model.create(req.body);
		res.status(201).json({
			status: 'success',
			data: {
				data: doc
			}
		});
	});

exports.updateOne = Model =>
	catchAsync(async (req, res, next) => {
		const {id} = req.params;
		const {body} = req;
		const doc = await Model.findByIdAndUpdate(id, body, {
			new: true,
			runValidators: true
		});

		if (!doc) {
			return next(new AppError(`There is not tour with this id`, 404));
		}
		res.status(200).json({
			status: 'success',
			data: {data: doc}
		});
	});
