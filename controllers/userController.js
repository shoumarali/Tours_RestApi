const User = require('../models/userModel');
const AppError = require('../utils/AppError');
const {catchAsync} = require('../utils/catchAsync');
const {
	getAll,
	getOneDoc,
	deleteOne,
	createOne,
	updateOne
} = require('./CrudController');

const filterObj = (obj, ...allowedFields) => {
	const newObj = {};
	Object.keys().forEach(key => {
		if (allowedFields.includes(key)) newObj[key] = obj[key];
	});
	return newObj;
};

exports.updateMe = catchAsync(async (req, res, next) => {
	const {password, confirmPassword} = req.body;
	if (password || confirmPassword) {
		return next(
			new AppError(
				'This route is not for password updates. Please use /updateMyPassword.',
				400
			)
		);
	}
	const filteredBody = filterObj(req.body, 'name', 'email');
	const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
		new: true,
		runValidators: true
	});

	res.status(201).json({
		status: 'success',
		data: {
			user: updatedUser
		}
	});
});

exports.deleteMe = catchAsync(async (req, res, next) => {
	await User.findByIdAndUpdate(req.user.id, {active: false});
	res.status(204).json({
		status: 'success',
		data: null
	});
});

exports.getMe = (req, res, next) => {
	req.params.id = req.user.id;
	next();
};

exports.createUser = (req, res) => {
	res.status(500).json({
	  status: 'error',
	  message: 'This route is not defined! Please use /signup instead'
	});
  };

// only for admin
exports.createUser = createOne(User);
exports.updateUser = updateOne(User);
exports.deleteUser = deleteOne(User);
exports.getUser = getOneDoc(User);
exports.getAllUsers = getAll(User);
