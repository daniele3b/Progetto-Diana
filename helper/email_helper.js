const {transporter}=require('../startup/email_sender')
function PasswordRecoveryMail(email,pw)

{

    let info = transporter.sendMail({
        from: '"Progetto Diana" <progetto-diana@libero.it>', // sender address
        to: email+','+email, // list of receivers
        subject: "Temporary pw", // Subject line
        text: "This is your temporary pw:"+pw, // plain text body
        html: "<body><h1> Please in the next Log in remember to change the password</h1><br><span>Log in with this temporary pw: <b>"+pw+" </b></span></body>", // html body
     });
}


exports.PasswordRecoveryMail=PasswordRecoveryMail