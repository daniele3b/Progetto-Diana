const router = require('express').Router()
const bodyParser = require('body-parser')
const {calculateCF} = require('../helper/registration_helper')
const {User,validateUser} = require('../models/user')
const OAuthUser = require('../models/OAuth-user')
const bcrypt = require('bcrypt')
const config = require('config')

const urlencodedParser = bodyParser.urlencoded({extended:false})

router.post('/', urlencodedParser , async(req,res) => {
    const googleId = req.body.googleId
    const repeat_password = req.body.repeat_password

    const name = req.body.name
    const surname = req.body.surname
    const sex = req.body.sex
    const birthdate = new Date(req.body.birthdate); 
    const birthplace = req.body.birthplace
    const email = req.body.email
    const phone = req.body.phone
    const password = req.body.password

    const {error} = validateUser({name,surname,sex,birthdate,birthplace,email,phone,password})
    if (error)  return res.status(400).send(error.details[0].message)
    if (password !== repeat_password)   return res.status(400).send("Passwords do not match")

    const birth = req.body.birthdate.split('/')
    const day = birth[0]
    const month = birth[1]
    const year = birth[2]
    const CF = calculateCF(name,surname,sex,day,month,year,birthplace)

    let user = await User.find({CF:CF})
    if(user.length==0) {
        user = new User({
            CF: CF,
            type: 'cittadino',
            name: name,
            surname: surname,
            sex: sex,
            birthdate: birthdate,
            birthplace: birthplace,
            email: email,
            phone: phone,
            password: password
        })

        const salt = await bcrypt.genSalt(config.get('pw_salt'));
        user.password = await bcrypt.hash(user.password, salt);

        await user.save()
        .then( (result) => { return res.status(200).send('You have been registered correctly!')})
        .catch( (err) => { return res.status(404).send('Error, please try again')})

        OAuthUser.deleteOne({googleId:googleId})
        .catch( (err) => { return res.status(500).send('OAU1')})

    } else{
            res.status(404).send('User already registered')
    }    
})

module.exports = router