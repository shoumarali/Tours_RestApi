const mongoose = require('mongoose');
const slugify = require('slugify');

const tourSchema = new mongoose.Schema(
	{
		name: {
			type: String,
			required: [true, 'A tour must have a name'],
			unique: true,
			trim: true
		},
		slug: String,
		difficulty: {
			type: String,
			required: [true, 'A tour must have a difficulty'],
			enum: {
				values: ['easy', 'medium', 'difficult'],
				message: 'Tours difficulty must be either easy, medium or difficult'
			}
		},
		price: {
			type: Number,
			required: [true, 'A tour must have a price']
		},
		duration: {
			type: Number,
			required: [true, 'A tour must have a duration']
		},
		discountPrice: {
			type: Number,
			validate: {
				validator: function (val) {
					return val < this.price;
				},
				message: 'Discount price must be less than the original price'
			}
		},
		summary: {
			type: String,
			required: [true, 'A tour must have a summary']
		},
		description: {
			type: String,
			trim: true
		},
		maxGroupSize: {
			type: Number,
			required: [true, 'A tour must have a max group size']
		},
		ratingsAverage: {
			type: Number,
			required: [true, 'A tour must have a ratings Average'],
			min: [1, 'Tours rating must be above 1.0'],
			max: [5, 'Tours rating must be under 5.0'],
			set: val => Math.round(val * 10) / 10
		},
		ratingsQuantity: {
			type: Number,
			default: 0
		},
		imageCover: {
			type: String,
			required: [true, 'A tour must have a cover image']
		},
		images: [String],
		createdAt: {
			type: Date,
			default: Date.now(),
			select: false
		},
		startDates: {
			type: [Date]
		},
		secretTour: {
			type: Boolean,
			default: false
		},
		startLocation: {
			type: {
				type: String,
				default: 'Point',
				enum: ['Point']
			},
			coordinates: [Number],
			address: String,
			description: String
		},
		locations: [
			{
				type: {
					type: String,
					default: 'Point',
					enum: ['Point']
				},
				coordinates: [Number],
				address: String,
				description: String,
				day: Number
			}
		],
		guides: [
			{
				type: mongoose.Schema.ObjectId,
				ref: 'User'
			}
		]
	},
	{
		toJSON: {virtuals: true},
		toObject: {virtuals: true}
	}
);

tourSchema.index({price: 1, ratingsAverage: -1});
tourSchema.index({slug: 1});
tourSchema.index({startLocation: '2dsphere'});

tourSchema.virtual('reviews', {
	ref: 'Review',
	foreignField: 'tour',
	localField: '_id'
});

tourSchema.pre('save', function (next) {
	this.slug = slugify(this.name, {
		lower: true
	});
	next();
});

// tourSchema.pre('save', async function (next) {
// 	const guidesPromises = this.guides.map(async el => await User.findById(el));
// 	this.guides = await Promise.all(guidesPromises);
// 	next();
// });

tourSchema.pre(/^find/, function (next) {
	this.find({secretTour: {$ne: true}});
	next();
});

tourSchema.pre(/^find/, function (next) {
	this.populate({
		path: 'guides',
		select: '-__v -passwordChangeAt'
	});
	next();
});

const Tour = mongoose.model('Tour', tourSchema);
module.exports = Tour;
