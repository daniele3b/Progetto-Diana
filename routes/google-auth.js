const express = require('express')
const router = express.Router()
const passport = require('passport')


router.get('/', passport.authenticate('google', {
    scope: ['email','profile']
}))


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