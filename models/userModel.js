const crypto = require('crypto');
const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
	name: {
		type: String,
		required: [true, 'Please provide your name']
	},
	email: {
		type: String,
		required: [true, 'Please provide your email'],
		unique: true,
		lowercase: true,
		validate: [validator.isEmail, 'Please provide a valid email']
	},
	password: {
		type: String,
		required: [true, 'Please provide your password'],
		select: false
	},
	passwordConfirm: {
		type: String,
		required: [true, 'Please confirm you password'],
		validate: {
			validator: function (val) {
				return this.password === val;
			},
			message: 'Passwords are not the same!'
		}
	},
	photo: String,
	role: {
		type: String,
		enum: ['user', 'admin', 'guide', 'leade-guide'],
		default: 'user'
	},
	active: {
		type: Boolean,
		default: true,
		select: false
	},
	passwordChangeAt: Date,
	passwordResetToken: String,
	passwordResetExpires: Date
});

// userSchema.pre('save', async function (next) {
// 	if (!this.isModified('password')) return next();
// 	this.password = await bcrypt.hash(this.password, 12);
// 	this.passwordConfirm = undefined;
// 	next();
// });

userSchema.pre('save', function (next) {
	if (!this.isModified('password') || this.isNew) return next();
	this.passwordChangeAt = Date.now() - 1000;
	next();
});

userSchema.pre(/^find/, function (next) {
	this.find({active: {$ne: false}});
	next();
});

userSchema.methods.correctPassword = async function (
	candidatePassword,
	userPassword
) {
	return await bcrypt.compare(candidatePassword, userPassword);
};

userSchema.methods.changePasswordAfter = function (JWTTimestamp) {
	if (this.passwordChangeAt) {
		const changedTimestamp = parseInt(
			this.passwordChangeAt.getTime() / 1000,
			10
		);
		return changedTimestamp > JWTTimestamp;
	}
	return false;
};

userSchema.methods.createPasswordResetToken = function () {
	const resetToken = crypto.randomBytes(32).toString('hex');

	this.passwordResetToken = crypto
		.createHash('sha256')
		.update(resetToken)
		.digest('hex');

	this.passwordResetExpires = Date.now() + 10 * 60 * 1000;

	return resetToken;
};

const User = mongoose.model('User', userSchema);
module.exports = User;
