const reviewRouter = require('express').Router({mergeParams: true});
const {
	getAllReviews,
	createReview,
	setToursUsersId,
	deleteReview,
	updateReview,
	getReview
} = require('./../controllers/reviewController');
const {protect, restrictTo} = require('./../controllers/authController');

reviewRouter.use(protect);

reviewRouter
	.route('/')
	.get(getAllReviews)
	.post(restrictTo('user'), setToursUsersId, createReview);

reviewRouter
	.route('/:id')
	.get(getReview)
	.patch(restrictTo('admin', 'user'), updateReview)
	.delete(restrictTo('admin', 'user'), deleteReview);

module.exports = reviewRouter;
