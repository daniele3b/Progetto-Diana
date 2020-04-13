const express = require('express')
var request = require('request')
const router = express.Router()
const {Meteo, Meteo7days, validate}=require('../models/meteo')


/**
 * @swagger
 * tags:
 *   name: Weather Report & UV Rays
 *   description: Weather forecast & UV Rays management APIs
 */ 

 /**
* @swagger 
* /weather/uv/now:
*  get:
*    tags: [Weather Report & UV Rays]
*    description: Use to request the last UV rays' data in the city.
*    responses:
*       '200':
*         description: A successful response, data available in JSON format, 
*               <br>"uv_value" float which represent the UV rays's value now,
*               <br>"uv_value_time" string which represent the time of UV ray's value (YYYY-MM-DDThh:mm:ss.xxxZ),
*               <br>"uv_max" float which represent the maximum UV rays's value of the day,
*               <br>"uv_max_time" string which represent the time of maximum UV ray's value (YYYY-MM-DDThh:mm:ss.xxxZ),
*               <br>"ozone_value" float which represent the ozone's value ,
*               <br>"ozone_time" string which represent the time of ozone's value (YYYY-MM-DDThh:mm:ss.xxxZ),
*         schema:
*           type: object
*           properties:
*               uv_value:
*                   type: number
*                   format: float
*                   example: 1.234
*               uv_value_time:
*                   type: string
*                   format: date-time
*               uv_max:
*                   type: number
*                   format: float
*                   example: 1.234
*               uv_max_time:
*                   type: string
*                   format: date-time
*               ozone_value:
*                   type: number
*                   format: float
*                   example: 1.234
*               ozone_time:
*                   type: string
*                   format: date-time  
*       '500':
*         description: Internal server error  
*/

router.get('/uv/now', async (req,res) =>{

    var options = { method: 'GET',
        url: 'https://api.openuv.io/api/v1/uv',
        qs: { lat: '41.89', lng: '12.48'},
        headers: 
        { 'content-type': 'application/json',
            'x-access-token': process.env.UVRAYS_KEY } };

    request(options, function (error, response, body) {
        if (error) throw new Error(error);
        else{
            var info = JSON.parse(body)

            var tosend = {
                    'uv_value' : info.result.uv,
                    'uv_value_time' : info.result.uv_time,
                    'uv_max' : info.result.uv_max,
                    'uv_max_time' : info.result.uv_max_time,
                    'ozone_value' : info.result.ozone,
                    'ozone_time' : info.result.ozone_time
                }

            res.status(200).send(tosend);

        }
    });


});

/**
* @swagger 
* /weather/uv/:date:
*  get:
*    tags: [Weather Report & UV Rays]
*    description: Use to request the last UV rays' data in the city.
*    responses:
*       '200':
*         description: A successful response, data available in JSON format, 
*               <br>"uv_value" float which represent the UV rays's value of the day choosen,
*               <br>"uv_value_time" string which represent the time of UV ray's value (YYYY-MM-DDThh:mm:ss.xxxZ),
*               <br>"uv_max" float which represent the maximum UV rays's value of the day,
*               <br>"uv_max_time" string which represent the time of maximum UV ray's value (YYYY-MM-DDThh:mm:ss.xxxZ)
*         schema:
*           type: object
*           properties:
*               uv_value:
*                   type: number
*                   format: float
*                   example: 1.234
*               uv_value_time:
*                   type: string
*                   format: date-time
*               uv_max:
*                   type: number
*                   format: float
*                   example: 1.234
*               uv_max_time:
*                   type: string
*                   format: date-time
*       '500':
*         description: Internal server error
*    parameters:
*       - name: date
*         description: date choosen, 'YYYY-MM-DD'
*               <br>regex pattern = '{2020}-[0-1][0-9]-[0-3][0-9]'
*         required: true
*         type: String
*         pattern: '^{2020}-[0-1][0-9]-[0-3][0-9]$'  
*/

router.get('/uv/:date', async (req,res) =>{
    var par1 = req.params.date + 'T11:00:00.000Z'
    var options = { method: 'GET',
        url: 'https://api.openuv.io/api/v1/uv',
        qs: { lat: '41.89', lng: '12.48', dt: par1},
        headers: 
        { 'content-type': 'application/json',
            'x-access-token': process.env.UVRAYS_KEY } };

    request(options, function (error, response, body) {
        if (error) throw new Error(error);
        else{
            var info = JSON.parse(body)

            var tosend = {
                    'uv_value' : info.result.uv,
                    'uv_value_time' : info.result.uv_time,
                    'ux_max' : info.result.uv_max,
                    'uv_max_time' : info.result.uv_max_time,/*
                    'ozone_value' : info.result.ozone,
                    'ozone_time' : info.result.ozone_time*/
                }

            res.status(200).send(tosend);

        }
    });


});

/**
* @swagger 
* /weather/report/last:
*  get:
*    tags: [Weather Report & UV Rays]
*    description: Use to request the last report of weather forecast in the city.
*    responses:
*       '200':
*         description: A successful response, data available in JSON format, 
*               <br>"data" is a String object which represent the date (dd/mm/yyyy) of the last report,
*               <br>"orario" is a String object which represent the time (hh:mm:ss) of the last report,
*               <br>"datastamp" is a Number object which represent the UNIX datastamp of the last report,
*               <br>"description" is a String object which represent a general description of the weather,
*               <br>"t_att" is a Number object which represent the current temperature,
*               <br>"humidity" is a Number object which represent the current humidity,
*               <br>"wind" is a Number object which represent the current wind speed
*         schema:
*           type: object
*           properties:
*               data:
*                   type: string
*               orario:
*                   type: string
*               datastamp:
*                   type: integer
*                   example: 1234
*               descrizione:
*                   type: string
*               t_att:
*                   type: integer
*                   example: 1234
*               humidity:
*                   type: integer
*                   example: 1234
*               wind:
*                   type: integer
*                   example: 1234
*               
*       '500':
*         description: Internal server error
*/

router.get('/report/last' , async (req,res) => {
    
    const result = await Meteo.findOne().sort('-_id')
    if(!result) res.status(500).send("Internal server error.")
    else{
        var tosend = {
            "data": result.data,
            "orario": result.orario,
            "datastamp": result.datastamp,
            "descrizione": result.descrizione,
            "t_att": result.t_att,
            "humidity": result.humidity,
            "wind": result.wind  
            } 

        res.status(200).send(tosend)
    }
});


/**
* @swagger 
* /weather/report/7daysforecast:
*  get:
*    tags: [Weather Report & UV Rays]
*    description: Use to request up to 7 days weather forecast.
*    responses:
*       '200':
*         description: A successful response, data available in JSON format,
*               <br>each field of the array represents a day 
*               <br>"id" is a String object which is used as identifier
*               <br>"data" is a String object which represent the date (dd/mm/yyyy) of the forecast's day,
*               <br>"datastamp" is a Number object which represent the UNIX datastamp of the day's forecast,
*               <br>"descrizione" is a String object which represent a general description of the weather's forecast,
*               <br>"t_min" is a Number object which represent the day's minimum temperature,
*               <br>"t_max" is a Number object which represent the day's maximum temperature,
*               <br>"humidity" is a Number object which represent the day's average humidity,
*               <br>"wind" is a Number object which represent the day's average wind speed
*         schema:
*           type: object
*           properties:
*               array:
*                   type: object
*                   properties: 
*                       id:
*                           type: string
*                       data:
*                           type: string 
*                       datastamp:
*                           type: number 
*                           example: 1234
*                       descrizione:
*                           type: string 
*                       t_min:
*                           type: number 
*                           example: 1234
*                       t_max:
*                           type: number 
*                           example: 1234
*                       humidity:
*                           type: number 
*                           example: 1234
*                       wind:
*                           type: number 
*                           example: 1.234
*                                
*       '500':
*         description: Internal server error
*/
router.get('/report/7daysforecast' , async (req,res) => {
    var lin = 'https://api.openweathermap.org/data/2.5/onecall?lat=41.89&lon=12.48&appid='+ process.env.METEO_KEY;
    request.get(lin, (error, response, body) => {
        if (!error && response.statusCode == 200) {
            var info = JSON.parse(body); 
            var datastamp = [];
            var descrizione = [];
            var temp_min = [];
            var temp_max = [];
            var umidita = [];
            var wind = [];
            var data = [];
            for (i = 0; i < 7; i++) {
                datastamp[i] = info.daily[i+1].dt;
                descrizione[i] = info.daily[i+1].weather[0].main + ", " + info.daily[i].weather[0].description;
                temp_min[i] = Math.trunc(info.daily[i+1].temp.min-273.15);
                temp_max[i] = Math.trunc(info.daily[i+1].temp.max-273.15);
                umidita[i] = info.daily[i+1].humidity;
                wind[i] = info.daily[i+1].wind_speed;
                
                
                var d = new Date(datastamp[i]*1000);
                var day = d.getDate().toString(); 
                if(day.length==1) day = '0'+day
                var month = (d.getMonth()+1).toString();
                if(month.length==1) month = '0'+month
                data[i] = day + '/' + month + '/' + d.getFullYear(); 
            }   
            
            //const Meteo = mongoose.model('Meteo', meteoSchema);
        
            async function creaMeteo(){           
                var meteo7days = new Meteo7days({
                    array: [{
                        data: data[0],
                        datastamp: datastamp[0],
                        descrizione: descrizione[0],
                        t_min: temp_min[0],
                        t_max: temp_max[0],
                        humidity: umidita[0],
                        wind: wind[0]  
                    },{
                        data: data[1],
                        datastamp: datastamp[1],
                        descrizione: descrizione[1],
                        t_min: temp_min[1],
                        t_max: temp_max[1],
                        humidity: umidita[1],
                        wind: wind[1]  
                    },{
                        data: data[2],
                        datastamp: datastamp[2],
                        descrizione: descrizione[2],
                        t_min: temp_min[2],
                        t_max: temp_max[2],
                        humidity: umidita[2],
                        wind: wind[2]  
                    },{
                        data: data[3],
                        datastamp: datastamp[3],
                        descrizione: descrizione[3],
                        t_min: temp_min[3],
                        t_max: temp_max[3],
                        humidity: umidita[3],
                        wind: wind[3]  
                    },{
                        data: data[4],
                        datastamp: datastamp[4],
                        descrizione: descrizione[4],
                        t_min: temp_min[4],
                        t_max: temp_max[4],
                        humidity: umidita[4],
                        wind: wind[4]  
                    },{
                        data: data[5],
                        datastamp: datastamp[5],
                        descrizione: descrizione[5],
                        t_min: temp_min[5],
                        t_max: temp_max[5],
                        humidity: umidita[5],
                        wind: wind[5]  
                    },{
                        data: data[6],
                        datastamp: datastamp[6],
                        descrizione: descrizione[6],
                        t_min: temp_min[6],
                        t_max: temp_max[6],
                        humidity: umidita[6],
                        wind: wind[6]  
                    }]
                });


            //REMINDER: devo decidere se è necessario salvare sul database
            res.status(200).send(meteo7days)/*
            try{
                const result = await meteo7days.save();
            }catch(ex){
                console.log(ex);
            }*/
            };

        creaMeteo();
        
        }else res.status(404).send("Not found.")
    });
});

/**
* @swagger 
* /weather/report/history/:date:
*  get:
*    tags: [Weather Report & UV Rays]
*    description: Use to request a weather report on a single day in history.
*    responses:
*       '200':
*         description: A successful response, data available
*       '500':
*         description: Internal service error    
*    parameters:
*       - name: date
*         description: date choosen, regex pattern
*         required: true
*         type: String
*         pattern: '^{2020}-[0-1][0-9]-[0-3][0-9]$'
*    
*/

router.get('/report/history/:date' , async (req,res) => {
    var par = req.params.date // yyyy-mm-dd
    var miadata = new Date();
    miadata.setDate(parseInt(par.substr(8,2)));
    miadata.setMonth(parseInt(par.substr(5,2))-1);
    miadata.setYear(parseInt(par.substr(0,4)));
    var tomorrow = new Date(miadata)
    tomorrow.setDate(tomorrow.getDate()+1)
    var par1 = miadata.toISOString().substr(0,10) 
    var par2 = tomorrow.toISOString().substr(0,10) 

    var lin = 'http://api.weatherbit.io/v2.0/history/daily?&city=Rome,it&start_date='+par1+'&end_date='+par2+'&tz=local&key='+ process.env.METEO_HISTORY_KEY;
    request.get(lin, (error, response, body) => {
        if (!error && response.statusCode == 200) {
            var info = JSON.parse(body)
            var tosend = {
                    'date': info.data[0].datetime,
                    't_min' : info.data[0].min_temp,
                    't_max' : info.data[0].max_temp,
                    'wind': info.data[0].wind_spd,
                    'humidity': info.data[0].rh
                }
            res.status(200).send(tosend)
        }else res.status(404).send('Not found.')
    });
});

module.exports = router