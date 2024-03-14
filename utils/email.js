const nodemailer = require('nodemailer');

const sendEmail = async options => {
	const transporter = nodemailer.createTransport({
		host: process.env.EMAIL_HOST,
		port: process.env.EMAIL_PORT,
		auth: {
			user: process.env.EMAIL_USER,
			pass: process.env.EMAIL_PASS
		}
	});

	await transporter.sendMail({
		from: 'ali <ali.io>',
		to: options.email,
		subject: options.subject,
		text: options.message
	});
};

module.exports = sendEmail;
