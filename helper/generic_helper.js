function validateDate(date)
{
    return (!isNaN(date) && date instanceof Date)
}


exports.validateDate=validateDate


/*  TO BE USED AS MIDDLEWARE!
*
module.exports = function(req,res,next) {
    if (req.params.date_start && ( isNaN(date_start) || date_start instanceof Date) ) 
        return false
    if (req.params.date_stop && ( isNaN(date_stop) || date_stop instanceof Date) )
        return false 
    return true
}
*
*/