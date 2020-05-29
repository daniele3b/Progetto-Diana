const express = require('express')
const router = express.Router()
const passport = require('passport')

/**
* @swagger
* /sign-in/google:
*  get:
*    tags: [OAuth 2.0]
*    description: Use to register and login using your Google account.
*/
router.get('/', passport.authenticate('google', {
    scope: ['email','profile']
}))

/**
* @swagger
* /sign-in/google/redirect:
*  get:
*    tags: [OAuth 2.0]
*    description: Redirect URL hitten after a successfull login with your Google account.
*/
router.get('/redirect', passport.authenticate('google'), (req,res) => {
    const user = {
        gid: req.user.googleId,
        name: req.user.name,
        surname: req.user.surname,
        email: req.user.email
    }
    res.render('oauth_complete' , {user})
})

module.exports = router