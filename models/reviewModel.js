const mongoose = require('mongoose');
const Tour = require('./tourModel');

const reviewSchema = new mongoose.Schema(
	{
		review: {
			type: String,
			required: [true, 'Review can not be empty']
		},
		rating: {
			type: Number,
			min: 1,
			max: 5
		},
		user: {
			type: mongoose.Schema.ObjectId,
			ref: 'User',
			required: [true, 'Review must belong to a user']
		},
		tour: {
			type: mongoose.Schema.ObjectId,
			ref: 'Tour',
			required: [true, 'Review must belong to a tour']
		},
		createdAt: {
			type: Date,
			default: Date.now
		}
	},
	{
		toJSON: {virtuals: true},
		toObject: {virtuals: true}
	}
);

reviewSchema.index(
	{tour: 1, user: 1},
	{
		unique: true
	}
);

reviewSchema.pre(/^find/, function (next) {
	this.populate({
		path: 'user',
		select: 'name photo'
	});
	next();
});

reviewSchema.statics.calcAverageRatings = async function (tourId) {
	const stats = await this.aggregate([
		{
			$match: {tour: tourId}
		},
		{
			$group: {
				_id: '$tour',
				nRating: {$sum: 1},
				avgRating: {$avg: '$rating'}
			}
		}
	]);
	if (stats.length > 0) {
		await Tour.findByIdAndUpdate(tourId, {
			ratingsAverage: stats[0].avgRating,
			ratingsQuantity: stats[0].nRating
		});
	} else {
		await Tour.findByIdAndUpdate(tourId, {
			ratingsAverage: 0,
			ratingsQuantity: 4.5
		});
	}
};

reviewSchema.post('save', function () {
	this.constructor.calcAverageRatings(this.tour);
});

reviewSchema.pre(/^findOneAnd/, async function (next) {
	this.review = await this.findOne();
	next();
});

reviewSchema.post(/^findOneAnd/, async function () {
	await this.review.constructor.calcAverageRatings(this.review.tour);
});

const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;
