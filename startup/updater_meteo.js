const mongoose = require('mongoose')
var request = require('request')
require('dotenv').config()
const {Meteo,validate}=require('../models/meteo')

function updateMeteo(){
    var lin = 'http://api.openweathermap.org/data/2.5/weather?q=rome,it&appid='+ process.env.METEO_KEY;
    request.get(lin, (error, response, body) => {
        if (!error && response.statusCode == 200) {
            var info = JSON.parse(body); 

            var d = new Date();
            var day = d.getDate().toString(); 
            if(day.length==1) day = '0'+day
            var month = (d.getMonth()+1).toString();
            if(month.length==1) month = '0'+month
            var data = day + "/" + month + "/" + d.getFullYear();
            
            var hh = d.getHours().toString();
            if(hh.length==1) hh = '0'+hh
            var mm = d.getMinutes().toString();
            if(mm.length==1) mm = '0'+mm
            var ss = d.getSeconds().toString();
            if(ss.length==1) ss = '0'+ss
            var orario =  hh + ":" + mm + ":" + ss;

            var datastamp = info.dt;
            var descrizione = info.weather[0].main + ", " + info.weather[0].description;
            var temp = Math.trunc(info.main.temp-273.15);
            //var temp_min = Math.trunc(info.main.temp_min-273.15);
            //var temp_max = Math.trunc(info.main.temp_max-273.15);
            var umidita = info.main.humidity;
            var wind = info.wind.speed;
        
            //const Meteo = mongoose.model('Meteo', meteoSchema);
        
            async function creaMeteo(){           
                var meteo = new Meteo({
                    data: data,
                    orario: orario,
                    datastamp: datastamp,
                    descrizione: descrizione,
                    t_att: temp,
                    //t_min: temp_min,
                    //t_max: temp_max,
                    humidity: umidita,
                    wind: wind  
                });


            try{
                const result = await meteo.save();
            }catch(ex){
                console.log(ex);
            }
        };

        creaMeteo();
        
        }
    });
    
}

exports.updateMeteo=updateMeteo