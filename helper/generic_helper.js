function validateDate(date)
{
    return (date instanceof Date && !isNaN(date))
}


exports.validateDate=validateDate