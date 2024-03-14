const fs = require('fs');

const dotenv = require('dotenv');
const mongoose = require('mongoose');
const Tour = require('./../../models/tourModel');
const User = require('./../../models/userModel');
const Review = require('./../../models/reviewModel');

dotenv.config({path: './../../config.env'});

const toursData = JSON.parse(
	fs.readFileSync('./tours.json', 'utf-8', err => console.log(err))
);

const usersData = JSON.parse(
	fs.readFileSync('./users.json', 'utf-8', err => console.log(err))
);

const reviewsData = JSON.parse(
	fs.readFileSync('./reviews.json', 'utf-8', err => console.log(err))
);

mongoose
	.connect(process.env.DB)
	.then(() => console.log('Connected to db'))
	.catch(err => console.log(err));

async function importData() {
	await Promise.all([
		Tour.create(toursData),
		User.create(usersData, {validateBeforeSave: false}),
		Review.create(reviewsData)
	]);
	console.log('data imported');
	process.exit(0);
}

async function deleteData() {
	await Promise.all([
		Tour.deleteMany(),
		User.deleteMany(),
		Review.deleteMany()
	]);
	console.log('DB is empty');
	process.exit(0);
}

if (process.argv[2] === '--import') {
	importData();
} else if (process.argv[2] === '--delete') {
	deleteData();
} else {
	process.exit(1);
}
