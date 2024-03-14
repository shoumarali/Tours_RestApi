const AppError = require('../utils/AppError');
const {catchAsync} = require('../utils/catchAsync');
const Tour = require('./../models/tourModel');
const {
	getAll,
	getOneDoc,
	deleteOne,
	createOne,
	updateOne
} = require('./CrudController');

exports.getAllTours = getAll(Tour);
exports.getTour = getOneDoc(Tour, 'reviews');
exports.deleteTour = deleteOne(Tour);
exports.createNewTour = createOne(Tour);
exports.updateTour = updateOne(Tour);

exports.getToursWithin = catchAsync(async (req, res, next) => {
	const {distance, unit, latlng} = req.params;
	const [lat, lng] = latlng.split(',');
	const radius = unit === 'mi' ? distance / 3963.2 : distance / 6378.1;
	if (!lat || !lng) {
		return next(
			new AppError(
				'Please provide latitude and longitude in the format lat,lng',
				400
			)
		);
	}
	const tours = await Tour.find({
		startLocation: {$geoWithIn: {$cenerSphere: [[lng, lat], radius]}}
	});

	res.status(200).json({
		status: 'success',
		results: tours.length,
		data: {
			tours
		}
	});
});

exports.getDistances = catchAsync(async (req, res, next) => {
	const {latlng, unit} = req.params;
	const [lat, lng] = latlng.split(',');
	if (!lat || !lng) {
		return next(
			new AppError(
				'Please provide latitude and longitude in the format lat,lng',
				400
			)
		);
	}
	const multiplier = unit === 'mi' ? 0.000621371 : 0.001;
	const distances = await Tour.aggregate([
		{
			$geoNear: {
				near: {type: 'Point', coordinates: [lng * 1, lat * 1]},
				distanceField: 'distance',
				distanceMultiplier: multiplier
			}
		},
		{
			$project: {
				distance: 1,
				name: 1
			}
		}
	]);
	res.status(200).json({
		status: 'success',
		data: {
			distances
		}
	});
});
