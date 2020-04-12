const Joi = require('joi')
const mongoose = require('mongoose')

const meteoSchema = new mongoose.Schema({
    data: {type:String, required: true},
    orario: {type:String, required: true},
    datastamp: {type:Number, required: true},
    descrizione: {type:String, required: true},
    t_att: {type:Number, required: true},
    t_min: {type:Number, required: true},
    t_max: {type:Number, required: true},
    humidity: {type:Number, required: true},
    wind: {type:Number, required: true}
});

const meteo7daysSchema = new mongoose.Schema({
    array: [{
        data: {type:String, required: true},
        datastamp: {type:Number, required: true},
        descrizione: {type:String, required: true},
        t_min: {type:Number, required: true},
        t_max: {type:Number, required: true},
        humidity: {type:Number, required: true},
        wind: {type:Number,required: true}
    }]
});


function validateMeteo(meteo) {
    const schema = {
        //
    }
    return Joi.validate(meteo,schema)
}

const Meteo = mongoose.model('Meteo', meteoSchema);
const Meteo7days = mongoose.model('Meteo7days', meteo7daysSchema);

exports.Meteo = Meteo
exports.Meteo7days = Meteo7days
exports.validate = validateMeteo