import dotenv from 'dotenv/config';
import nodemailer from 'nodemailer';


const transporter = nodemailer.createTransport({
	service: 'gmail',
	auth: {
		user: 'bansalvishakha64@gmail.com',
		pass: 'sxrzkfogxqafhpzk'
	}
});
 
function sendConfirmationEmail(name, email, user_id){
	transporter.sendMail({
	  from: 'bansalvishakha64@gmail.com',
	  to: email,
	  subject: "Please confirm your account",
	  html: `<h1>Email Confirmation</h1>
		  <h2>Hello ${name}</h2>
		  <p>Thank you for subscribing. Please confirm your email by clicking on the following link</p>
		  <a href=http://localhost:8080/verifyEmail/${user_id}> Click here</a>
		  </div>`,
	}).catch(err => console.log(err));
  };
 
  export {sendConfirmationEmail};


