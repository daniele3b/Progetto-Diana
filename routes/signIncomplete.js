const router = require('express').Router()

router.get('/', (req,res) => {
    const name = req.query.name
    const surname = req.query.surname
    const email = req.query.email
    // TO BE COMPLETED...
})

module.exports = router