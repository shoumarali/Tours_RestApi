const mongoose = require('mongoose');

const app = require('./app');

process.on('uncaughtException', (err, origin) => {
	console.log({err, origin});
	process.exit(1);
});

mongoose
	.connect(process.env.DB)
	.then(() => console.log('Connected to db successfully'))
	.catch(err => console.log(err));

const server = app.listen(3000, () =>
	console.log('Server is running on port 3000')
);

process.on('unhandledRejection', (reason, promise) => {
	console.log({reason, promise});
	server.close(() => {
		process.exit(1);
	});
});
