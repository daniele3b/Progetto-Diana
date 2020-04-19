const {User} = require('../models/user');
const {calculateCF} = require('./registration_helper')

const sleep = (milliseconds) => {
    return new Promise(resolve => setTimeout(resolve, milliseconds))
}
  
function getTokens() {
    let operator_token;
    let citizen_token;
    let admin_token;

    const cf_operator = calculateCF('Ivan','Giacomoni','M','31','05','1998','Latina')

    operator_token = new User({
        CF : cf_operator,
        type : 'operatore',
        name : 'Ivan',
        surname : 'Giacomoni',
        sex : 'M',
        birthdate : '1998-05-31',
        birthplace : 'Latina',
        email : 'federeristheway@gmail.com',
        phone : '1234567890',
        password : 'aCertainPassword'
    }).generateAuthToken();

    const cf_citizen = calculateCF('Daniele','Bufalieri','M','02','12','1998','Roma')

    citizen_token = new User({
        CF : cf_citizen,
        type : 'cittadino',
        name : 'Daniele',
        surname : 'Bufalieri',
        sex : 'M',
        birthdate : '1998-12-02',
        birthplace : 'Roma',
        email : 'federeristheway@gmail.com',
        phone : '1234567890',
        password : 'aCertainPassword1'
    }).generateAuthToken();

    const cf_admin = calculateCF('Laura','Giacomoni','F','30','04','2001','Latina')

    admin_token = new User({
        CF : cf_admin,
        type : 'admin',
        name : 'Laura',
        surname : 'Giacomoni',
        sex : 'F',
        birthdate : '2001-04-30',
        birthplace : 'Latina',
        email : 'emailDiLaura@gmail.com',
        phone : '1234567893',
        password : 'aCertainPassword2'
    }).generateAuthToken();

    return [citizen_token, operator_token, admin_token]
}

exports.sleep = sleep
exports.getTokens = getTokens