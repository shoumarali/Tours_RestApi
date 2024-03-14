const tourRouter = require('express').Router();
const {protect, restrictTo} = require('../controllers/authController');
const {
	createReview,
	getAllReviews
} = require('./../controllers/reviewController');
const {
	getAllTours,
	getTour,
	deleteTour,
	createNewTour,
	updateTour,
	getToursWithin,
	getDistances
} = require('./../controllers/tourController');
const reviewRouter = require('./reviewRoutes');

tourRouter.use('/:tourId/reviews', reviewRouter);


tourRouter
	.route('/tours-within/:distance/center/:latlng/unit/:unit')
	.get(getToursWithin);

tourRouter.route('/distances/:latlng/unit/:unit').get(getDistances);

tourRouter
	.route('/')
	.get(getAllTours)
	.post(protect, restrictTo('admin', 'lead-guide'), createNewTour);
tourRouter
	.route('/:id')
	.get(getTour)
	.delete(protect, restrictTo('admin', 'lead-guide'), deleteTour)
	.patch(protect, restrictTo('admin', 'lead-guide'), updateTour);

tourRouter
	.route('/:tourId/reviews/')
	.post(protect, restrictTo('user'), createReview);

module.exports = tourRouter;

