const {transporter}=require('../startup/email_sender')
const {User,validateUser}=require('../models/user')


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

async function  UpdateCitizen(start,end,zone,description){

    const res=await User.find({})
  
    var i=0;
    for(i=0;i<res.length;i++)
    {
        
        let info=transporter.sendMail({
            from: '"Progetto Diana" <progetto-diana@libero.it>', // sender address
            to: res[i].email+','+res[i].email, // list of receivers
            subject: "Announcement", // Subject line
            text: "This is an announcemente", // plain text body
            html: "<body><h1> Announcement:</h1><br> Zone: <b>"+zone+"</b><br> Date: <b> "+start+"->"+end+" </b><br><span>Description: <b>"+description+" </b></span></body>", // html body
        })
    }
}

exports.PasswordRecoveryMail=PasswordRecoveryMail
exports.UpdateCitizen=UpdateCitizen