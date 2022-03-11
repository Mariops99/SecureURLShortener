const nodemailer = require("nodemailer");
require('dotenv').config()

var transporter = nodemailer.createTransport({
    host: process.env.mailHost,
    port: process.env.mailPort,
    secure: true,
    auth: {
        user: process.env.mailUser,
        pass: process.env.mailPassword
    }
});

var mailOptions = {
    from: 'URLShortener' + process.env.mailUser,
    to: req.body.email,
    subject: "API KEY",
    text: `Here is your API KEY to start usign URLShortener\n\nAPI_KEY: ${user.uid}`
}

transporter.sendMail(mailOptions, (error, info) => {
    if(error) {
        res.render('index',  {result:error})
    }
})