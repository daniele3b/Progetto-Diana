const mongoose=require('mongoose')
const config = require('config')
const {User,validateUser}=require('../models/user')
const bcrypt=require('bcrypt')
require('dotenv').config()


function SuperUser_startup()
{
    return new  Promise(async (reject,resolve)=>{

        let superUser=new User({
            CF:process.env.ADMIN_CF,
            type:'admin',
            name:process.env.ADMIN_NAME,
            surname:process.env.ADMIN_SURNAME,
            sex:process.env.ADMIN_SEX,
            birthdate:process.env.ADMIN_BIRTHDATE,
            birthplace:process.env.ADMIN_BIRTHPLACE,
            email:process.env.ADMIN_EMAIL,
            phone:process.env.ADMIN_PHONE,
            password:process.env.ADMIN_PASSWORD
        })

        const salt = await bcrypt.genSalt(config.get('pw_salt'));
        superUser.password = await bcrypt.hash(superUser.password, salt);

        const res=await User.find({CF:superUser.CF})

        if(res.length==0) 
        {
            
            const r=await superUser.save()

            resolve('Super user set')
        }
        else {
            resolve('Super user already exist')
        }
        reject(-1)

    })

} 

exports.SuperUser_startup=SuperUser_startup

