module.exports = function(req, res, next) {
    if(req.user.type == 'cittadino') return res.status(403).send('Access denied');
    
    next();
}