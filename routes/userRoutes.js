const {
	updateMe,
	getMe,
	deleteMe,
	getAllUsers,
	createUser,
	getUser,
	deleteUser,
	updateUser
} = require('./../controllers/userController');
const {
	signUp,
	login,
	forgotPassword,
	resetPassword,
	protect,
	updatePassword,
	restrictTo
} = require('../controllers/authController');

const userRouter = require('express').Router();

userRouter.route('/signup').post(signUp);
userRouter.route('/login').post(login);
userRouter.route('/forgotPassword').post(forgotPassword);
userRouter.patch('/resetPassword/:token', resetPassword);

userRouter.use(protect);

userRouter.patch('/updateMe', updateMe);
userRouter.get('/me', protect, getMe, getUser);
userRouter.delete('/deleteMe', deleteMe);
userRouter.patch('/updateMyPassword', updatePassword);

userRouter.use(restrictTo('admin'));

userRouter.route('/').get(getAllUsers).post(createUser);
userRouter.route('/:id').get(getUser).delete(deleteUser).patch(updateUser);

module.exports = userRouter;
