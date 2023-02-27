import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
	service: 'gmail',
	auth: {
		user: 'bansalvishakha64@gmail.com', //server email id
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

function sendTransactionEmail(name, email, amount, to,  txnStatus){
	transporter.sendMail({
	  from: 'bansalvishakha64@gmail.com',
	  to: email,
	  subject: "Transaction details",
	  html: `<h2>Hello! ${name}</h2>
		  <p>You have sent ${amount} tokens to ${to}. Your transaction is ${txnStatus}.</p>
		  </div>`,
	}).catch(err => console.log(err));
};

export {sendTransactionEmail};


