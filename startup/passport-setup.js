const passport = require('passport')
const GoogleStrategy = require('passport-google-oauth20')
const OAuthUser = require('../models/OAuth-user')


passport.serializeUser((user,done) => {
    done(null, user.id)
})


passport.deserializeUser((id,done) => {
    OAuthUser.findById(id).then((user) => {
        done(null,user)
    })
})


passport.use(
    new GoogleStrategy({
        callbackURL: process.env.CALLBACK_URL,
        clientID: process.env.CLIENT_ID,
        clientSecret: process.env.CLIENT_SECRET
    }, async (accessToken, refreshToken, profile, done) => {
        OAuthUser.findOne({googleId: profile.id}).then((currentUser) => {
            if (currentUser) {
                console.log('User is : ' , currentUser)
                done(null, currentUser)
            } else {
                new OAuthUser ({ 
                    googleId: profile.id,
                    name:     profile.name.givenName,
                    surname:  profile.name.familyName,
                    email:    profile._json.email
                }).save().then((newUser) => {
                    console.log('created new user : ' , newUser)
                    done(null,newUser)
                })
            }
        })
    })
)