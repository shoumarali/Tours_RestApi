const Tour = require('./../models/tourModel');
const {catchAsync} = require('./../utils/catchAsync');

exports.getOverview = catchAsync(async (req, res, next) => {
	const tours = await Tour.find();

	res.status(200).render('overview', {
		title: 'All Tours',
		tours
	});
});

exports.getTour = catchAsync(async (req, res, next) => {
	const {slug} = req.params;
	const tour = await Tour.findOne({slug}).populate({
		path: 'reviews',
		fields: 'review rating user'
	});
	res.status(200).render('tour', {
		tour,
		title: `${tour.name} tour`
	});
});

exports.getLoginForm = (req, res, next) => {
	res.status(200).render('login', {
		title: 'Log into you account'
	});
};
