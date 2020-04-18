var CodiceFiscale = require('codice-fiscale-js');

function calculateCF(name,surname,gender,day,month,year,birthplace)
{
    var cf = new CodiceFiscale({
        name: name,
        surname:surname,
        gender:gender,
        day:day,
        month:month,
        year:year,
        birthplace:birthplace, 
    })
    return cf

}

exports.calculateCF=calculateCF