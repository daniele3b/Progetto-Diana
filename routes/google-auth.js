const express = require('express')
const router = express.Router()
const passport = require('passport')


router.get('/', passport.authenticate('google', {
    scope: ['email','profile']
}))


router.get('/redirect', passport.authenticate('google'), (req,res) => {
    const query_string = '/?name=' +req.user.name+ '&surname=' +req.user.surname+ '&email=' +req.user.email+ ''
    res.redirect('sign-in/complete'+query_string)
})

module.exports = router