const path = require('path');

const express = require('express');
const morgan = require('morgan');

const helmet = require('helmet');
const xss = require('xss-clean');
const mongoSanitize = require('express-mongo-sanitize');
const rateLimit = require('express-rate-limit');
const hpp = require('hpp');
const cookieParser = require('cookie-parser');
const cors = require('cors');

const AppError = require('./utils/AppError');
const globalErrorHandler = require('./controllers/hadleErrorController');

const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const reviewRouter = require('./routes/reviewRoutes');

const app = express();

app.set('view engine', 'pug');
app.set('veiws', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));

app.use(helmet());

app.use(cors({
  origin: true,
  credentials: true,
}));

process.env.NODE_ENV === 'development' && app.use(morgan('dev'));
app.use(
	'/api',
	rateLimit({
		limit: 100,
		windowMs: 60 * 60 * 1000,
		message: 'Too many requests from this IP, please try again in an hour!'
	})
);
app.use(express.json({limit: '10kb'}));
app.use(cookieParser());
app.use(mongoSanitize());
app.use(xss());
app.use(
	hpp({
	  whitelist: [
		'duration',
		'ratingsQuantity',
		'ratingsAverage',
		'maxGroupSize',
		'difficulty',
		'price'
	  ]
	})
  );
  


app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRouter);

app.all('*', (req, res, next) => {
	next(new AppError(`${req.originalUrl} doesnt exist on this server`, 404));
});

app.use(globalErrorHandler);

module.exports = app;
