function validateDate(date)
{
    return (!isNaN(date) && date instanceof Date)
}


exports.validateDate=validateDate