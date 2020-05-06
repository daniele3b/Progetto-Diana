const express = require('express')
var request = require('request')
const config = require('config')
const router = express.Router()
const logger = require('../startup/logging')
const {Meteo, Meteo7days, UVSchema, validate}=require('../models/meteo')
const auth = require('../middleware/auth')
const operator = require('../middleware/operator')


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
*               <br>"uv_value" float which represents the UV rays's value now,
*               <br>"uv_value_time" string which represents the time of UV ray's value (YYYY-MM-DDThh:mm:ss.xxxZ),
*               <br>"uv_max" float which represents the maximum UV rays's value of the day,
*               <br>"uv_max_time" string which represents the time of maximum UV ray's value (YYYY-MM-DDThh:mm:ss.xxxZ),
*               <br>"ozone_value" float which represents the ozone's value ,
*               <br>"ozone_time" string which represents the time of ozone's value (YYYY-MM-DDThh:mm:ss.xxxZ),
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
*       '404':
*         description: Invalid token provided
*       '401':
*         description: User is not logged in... user has to authenticate himself
*       '403':
*         description: User is not an operator or admin
*/

router.get('/uv/now', [auth, operator], async (req,res) =>{

    var options = { method: 'GET',
        url: config.get('apiuv_url') ,
        qs: { lat: config.get('Rome_lat'), lng: config.get('Rome_lon')},
        headers: 
        { 'content-type': 'application/json',
            'x-access-token': process.env.UVRAYS_KEY } };

    request(options, function (error, response, body) {
        if (error){ 
            res.status(500).send('Internal server error.');
            console.error('error:', error);
            logger.error('M5: Impossibile to get UV data from external server')
            console.log('M5')
            reject(error);
            return
        }
        else{
            var info = JSON.parse(body)

            async function creaUVSchema(){           
                var uvschema = new UVSchema({
                    "uv_value" : info.result.uv,
                    'uv_value_time' : info.result.uv_time,
                    'uv_max' : info.result.uv_max,
                    'uv_max_time' : info.result.uv_max_time,
                    'ozone_value' : info.result.ozone,
                    'ozone_time' : info.result.ozone_time ,
                    'data': info.result.uv_time.substr(0,10)
                });


            try{
                const result = await uvschema.save();
            }catch(ex){
                console.log(ex);
                console.error('error:', error);
                logger.error('M6: Impossibile to save UV data to database')
                console.log('M6')
                reject(error);
            }

            res.status(200).send(uvschema);

            };
            
            creaUVSchema();

        }
    });


});

router.get('/uv/real_time', auth, async (req,res) => {
    var lin = 'http://api.openweathermap.org/data/2.5/uvi?appid='+process.env.METEO_KEY+'&lat='+config.get('Rome_lat')+'&lon='+config.get('Rome_lon');
    request.get(lin, (error, response, body) => {
        if (!error && response.statusCode == 200) {
            var info = JSON.parse(body); 
            res.status(200).send(info)
        }
    });
    
});

router.get('/uv/forecast', auth, async (req,res) => {
    var lin = 'http://api.openweathermap.org/data/2.5/uvi/forecast?appid='+process.env.METEO_KEY+'&lat='+config.get('Rome_lat')+'&lon='+config.get('Rome_lon')+'&cnt=7';
    request.get(lin, (error, response, body) => {
        if (!error && response.statusCode == 200) {
            var info = JSON.parse(body); 
            res.status(200).send(info)
        }
    });
    
});


/**
* @swagger 
* /weather/uv/:date:
*  get:
*    tags: [Weather Report & UV Rays]
*    description: Use to request data from a choosen day in the city.
*    responses:
*       '200':
*         description: A successful response, data available in JSON format, 
*               <br>"uv_max" float which represents the maximum UV rays's value of the day,
*               <br>"uv_max_time" string which represents the time of maximum UV ray's value (YYYY-MM-DDThh:mm:ss.xxxZ)
*               <br>"ozone_value" float which represents the ozone's value,
*               <br>"ozone_time" string which represents the time of ozone's value (YYYY-MM-DDThh:mm:ss.xxxZ)
*         schema:
*           type: object
*           properties:
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
*       '400':
*         description: Bad request
*       '404':
*         description: Not found/Invalid token provided
*       '500':
*         description: Internal server error
*       '401':
*         description: User is not logged in... user has to authenticate himself
*       '403':
*         description: User is not an operator or admin
*    parameters:
*       - name: date
*         description: date choosen, 'YYYY-MM-DD'
*               <br>regex pattern = '{2020}-[0-1][0-9]-[0-3][0-9]'
*         required: true
*         type: String
*         pattern: '^{2020}-[0-1][0-9]-[0-3][0-9]$'  
*/

router.get('/uv/:date', [auth, operator], async (req,res) =>{

    if(!req.params.date.match('[0-9][0-9][0-9][0-9]-[0-9][0-9]-[0-9][0-9]')){ 
        res.status(400).send('Bad request.')
        return
    }

    const result = await (await UVSchema.findOne().sort('-_id').find({data: req.params.date}))
    if(!result || result[0]===undefined) res.status(404).send("Not found.")
    else {
        var tosend = {
            'uv_max': result[0].uv_max,
            'uv_max_time': result[0].uv_max_time,
            'ozone_value': result[0].ozone_value,
            'ozone_time': result[0].ozone_time
        }

        res.status(200).send(tosend)
    }
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
*               <br>"data" is a String object which represents the date (YYYY-MM-DDThh:mm:ss.xxxZ) of the last report,
*               <br>"datastamp" is a Number object which represents the UNIX datastamp of the last report,
*               <br>"description" is a String object which represents a general description of the weather,
*               <br>"t_att" is a Number object which represents the current temperature,
*               <br>"humidity" is a Number object which represents the current humidity,
*               <br>"wind" is a Number object which represents the current wind speed
*         schema:
*           type: object
*           properties:
*               data:
*                   type: string
*                   format: date-time
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
*       '404':
*         description: Invalid token provided
*       '401':
*         description: User is not logged in... user has to authenticate himself
*/

router.get('/report/last', auth, async (req,res) => {
    
    const result = await Meteo.findOne().sort('-_id')
    if(!result){ 
        res.status(500).send("Internal server error.")
        console.error('error:', error);
        logger.error('M3: Impossibile to get meteo report data from database')
        console.log('M3')
        reject(error);
        return
    }
    else{
        var tosend = {
            "data": result.data,
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
*               <br>"_id" is a String object which is used as identifier
*               <br>"data" is a String object which represents the date (YYYY-MM-DDThh:mm:ss.xxxZ) of the forecast's day,
*               <br>"datastamp" is a Number object which represents the UNIX datastamp of the day's forecast,
*               <br>"descrizione" is a String object which represents a general description of the weather's forecast,
*               <br>"t_min" is a Number object which represents the day's minimum temperature,
*               <br>"t_max" is a Number object which represents the day's maximum temperature,
*               <br>"humidity" is a Number object which represents the day's average humidity,
*               <br>"wind" is a Number object which represents the day's average wind speed
*         schema:
*           type: object
*           properties:
*               array:
*                   type: object
*                   properties: 
*                       _id:
*                           type: string
*                       data:
*                           type: string 
*                           format: date-time
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
*       '404':
*         description: Invalid token provided
*       '401':
*         description: User is not logged in... user has to authenticate himself
*/
router.get('/report/7daysforecast', auth, async (req,res) => {
    var lin = config.get('weather_report_url') + process.env.METEO_KEY;
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
                data[i] = d.toISOString();
                /*
                var day = d.getDate().toString(); 
                if(day.length==1) day = '0'+day
                var month = (d.getMonth()+1).toString();
                if(month.length==1) month = '0'+month
                data[i] = day + '/' + month + '/' + d.getFullYear(); */
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
        
        }else{
            res.status(500).send("Internal server error.")
            console.error('error:', error);
            logger.error('M4: Impossibile to get meteo report forecast from external server')
            console.log('M4')
            reject(error);
        }
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
*         description: A successful response, data available in JSON format, 
*               <br>"date" string which represents the report's day (YYYY-MM-DDThh:mm:ss.xxxZ),
*               <br>"t_min" number which represents minimum temperature in the choosen's day,
*               <br>"t_max" number which represents maximum temperature in the choosen's day,
*               <br> "wind" number which represents the average wind's speed  
*               <br> "humidity" number which represents the average humidity
*         schema:
*           type: object
*           properties:
*               date:
*                   type: string
*                   format: date-time
*               t_min:
*                   type: number
*                   format: float
*                   example: 1.234
*               t_max:
*                   type: number
*                   format: float
*                   example: 1.234
*               wind:
*                   type: number
*                   format: float
*                   example: 1.234
*               humidity:
*                   type: number
*                   format: float
*                   example: 1.234                   
*       '400':
*         description: Bad request
*       '404':
*         description: Not found/Invalid token provided
*       '401':
*         description: User is not logged in... user has to authenticate himself
*    parameters:
*       - name: date
*         description: date choosen, 'YYYY-MM-DD'
*               <br>regex pattern = '{2020}-[0-1][0-9]-[0-3][0-9]'
*         required: true
*         type: String
*         pattern: '^{2020}-[0-1][0-9]-[0-3][0-9]$'
*    
*/

router.get('/report/history/:date', auth, async (req,res) => {
    if(!req.params.date.match('[0-9][0-9][0-9][0-9]-[0-9][0-9]-[0-9][0-9]')){ 
        res.status(400).send('Bad request.')
        return
    }
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
        if (error || response.statusCode != 200) {
            res.status(404).send('Not found.')
        }else{
            var info = JSON.parse(body)
            var tosend = {
                    'date': miadata,
                    't_min' : info.data[0].min_temp,
                    't_max' : info.data[0].max_temp,
                    'wind': info.data[0].wind_spd,
                    'humidity': info.data[0].rh
                }
            res.status(200).send(tosend)
        }
    });
});

module.exports = router