const passport = require('passport')
const passportSetup = require('./passport-setup')
const cookieSession = require('cookie-session')

module.exports = function(app) {
    app.use(cookieSession({
        maxAge: 24*60*60*1000,
        keys: [process.env.COOKIE_KEY]
    }))

    app.use(passport.initialize())
    app.use(passport.session())
}
