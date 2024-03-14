const {promisify} = require('util');
const crypto = require('crypto');
const AppError = require('../utils/AppError');
const {catchAsync} = require('../utils/catchAsync');
const User = require('./../models/userModel');
const sendEmail = require('./../utils/email');
const jwt = require('jsonwebtoken');

const generateToken = id => {
	return jwt.sign({id}, process.env.JWT_SECRET, {
		expiresIn: process.env.JWT_EXPIRES_IN
	});
};

const createSendToken = (user, statusCode, res) => {
	const token = generateToken(user._id);


	const cookieOptions = {
		expires: new Date(
		  Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
		),
		httpOnly: true
	  };
	  if (process.env.NODE_ENV === 'production') cookieOptions.secure = true;
	
	res.cookie('jwt', token, cookieOptions);

	user.password = undefined;
	user.passwordResetToken = undefined;
	user.passwordResetExpires = undefined;

	console.log(res);
	res.status(statusCode).json({
		status: 'success',
		token,
		data: {
			user
		}
	});
};
exports.signUp = catchAsync(async (req, res, next) => {
	const newUser = await User.create({
		name: req.body.name,
		email: req.body.email,
		password: req.body.password,
		passwordConfirm: req.body.passwordConfirm
	});
	createSendToken(newUser, 201, res);
});

exports.login = catchAsync(async (req, res, next) => {
	const {email, password} = req.body;
	if (!email || !password) {
		return next(new AppError('Please enter email and password', 400));
	}
	const user = await User.findOne({email}).select('+password');

	if (!user || !(await user.correctPassword(password, user.password))) {
		return next(new AppError('Invalid email or password'), 401);
	}
	createSendToken(user, 200, res);
});

exports.isLoggedIn = catchAsync(async (req, res, next) => {
	let token;
	if (req.cookies.jwt) {
		token = req.cookies.jwt;
		const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
		const user = await User.findById(decoded.id);
		if (!user) {
			return next();
		}
		if (user.changePasswordAfter(decoded.iat)) {
			return next();
		}
		res.locals.user=user;
		return next();
	}
	next();
});

exports.protect = catchAsync(async (req, res, next) => {
	let token;
	if (
		req.headers.authorization &&
		req.headers.authorization.startsWith(`Bearer`)
	) {
		token = req.headers.authorization.split(' ')[1];
	} else if (req.cookies.jwt) {
		token = req.cookies.jwt;
	}
	if (!token) {
		return next(new AppError(`You are not login please login to access`, 401));
	}
	const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
	const user = await User.findById(decoded.id);
	if (!user) {
		return next(
			new AppError(`The user belongs to this token doesnt exist any more`, 401)
		);
	}
	if (user.changePasswordAfter(decoded.iat)) {
		return next(
			new AppError(`User recently changed password! Please log in again.`, 401)
		);
	}
	req.user = user;
	next();
});

exports.restrictTo = (...roles) => {
	return (req, res, next) => {
		if (!roles.includes(req.user.role)) {
			return next(
				new AppError('You dont have permision to perform this action', 403)
			);
		}
		next();
	};
};

exports.forgotPassword = catchAsync(async (req, res, next) => {
	const {email} = req.body;
	if (!email) {
		return next(new AppError('Please enter your email', 400));
	}
	const user = await User.findOne({email});
	if (!user) {
		return next(new AppError('Invalid Email', 401));
	}
	const resetToken = user.createPasswordResetToken();
	await user.save({validateBeforeSave: false});

	const resetURL = `${req.protocol}://${req.get(
		'host'
	)}/api/v1/users/resetPassword/${resetToken}`;

	const message = `Forgot your password? Submit a PATCH request with your new password and passwordConfirm to: ${resetURL}.\nIf you didn't forget your password, please ignore this email!`;

	try {
		await sendEmail({
			email: user.email,
			subject: 'Your password reset token (valid for 10 min)',
			message
		});

		res.status(200).json({
			status: 'success',
			message: 'Token sent to email!'
		});
	} catch (err) {
		user.passwordResetToken = undefined;
		user.passwordResetExpires = undefined;
		await user.save({validateBeforeSave: false});

		return next(
			new AppError('There was an error sending the email. Try again later!'),
			500
		);
	}
});

exports.resetPassword = catchAsync(async (req, res, next) => {
	const resettoken = req.params.token;
	const token = crypto.createHash('sha256').update(resettoken).digest('hex');

	const user = await User.findOne({
		passwordResetToken: token,
		passwordResetExpires: {$gt: Date.now()}
	});
	if (!user) {
		return next(new AppError(`token is invalid or has expired`, 400));
	}
	user.password = req.body.password;
	user.passwordConfirm = req.body.passwordConfirm;
	user.passwordResetToken = undefined;
	user.passwordResetExpires = undefined;
	await user.save();

	createSendToken(user, 200, res);
});

exports.updatePassword = catchAsync(async (req, res, next) => {
	const user = User.findById(req.user.id).select('+password');
	if (!(await user.correctPassword(req.body.passwordCurrent, user.password))) {
		return next(new AppError('Your current password is wrong.', 401));
	}
	user.password = req.body.password;
	user.passwordConfirm = req.body.passwordConfirm;
	await user.save();
	createSendToken(user, 200, res);
});
