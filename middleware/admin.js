module.exports = function(req, res, next) {
    if(req.user.type != 'admin') return res.status(403).send('Access denied.');
    
    next();
}