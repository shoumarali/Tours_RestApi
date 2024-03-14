const Review = require('./../models/reviewModel');
const {
	getAll,
	createOne,
	deleteOne,
	updateOne,
	getOneDoc
} = require('./crudController');

exports.setToursUsersId = (req, res, next) => {
	if (!req.body.tour) req.body.tour = req.params.tourId;
	if (!req.user.tour) req.body.user = req.user.id;
	next();
};

exports.createReview = createOne(Review);
exports.getAllReviews = getAll(Review);
exports.deleteReview = deleteOne(Review);
exports.updateReview = updateOne(Review);
exports.getReview = getOneDoc(Review);
