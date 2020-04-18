const jwt = require('jsonwebtoken');

require('dotenv').config()

module.exports = function (req, res, next) {
    const token = req.header('x-diana-auth-token');
    if(!token) return res.status(401).send('Acces denied. No token provided.');

    try{
        const decoded = jwt.verify(token, process.env.DIANA_TOKEN_KEY);
        req.user = decoded;
        next();
    }

    catch(ex){
        res.status(400).send('Invalid token.');
    }
}
