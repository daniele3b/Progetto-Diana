const express = require('express')
const {Agents,Chemical_Agent,validate}=require('../models/chemical_agents')
const moment=require('moment')
const router = express.Router()
const{validateDate}=require('../helper/generic_helper')
const auth = require('../middleware/auth')
const operator = require('../middleware/operator')

/**
 * @swagger
 * tags:
 *   name: Chemical_Agents
 *   description: Chemical Agents management APIs
 */ 


/**
* @swagger 
* /chemical_agents:
*  get:
*    tags: [Chemical_Agents]
*    description: Use to request all current data by the sensor in the city (latest available)
*    responses:
*       '200':
*         description: A successful response, data available return an array of object
*         schema:
*           type: object
*           properties:
*               sensor:
*                   type: string
*               reg_data:
*                   type: string
*                   format: date-time
*               uid:
*                   type: string
*               types:
*                   type: string
*                   enum:
*                       O3
*                       NO
*                       NO2
*                       NOX
*                       PM10
*                       PM25
*                       BENZENE
*                       CO
*                       SO2
*               value:
*                   type: number
*                   format: float
*                   example: 70.4
*               lat:
*                   type: string
*               long:
*                   type: string
*               type: object
*                                  
*       '404':
*         description: No data available
*       '400':
*         description: Invalid token provided
*       '401':
*         description: User is not logged in... user has to authenticate himself
*/

router.get('/', auth, async (req,res) => {

    const max_date= await Chemical_Agent.findOne()
    .sort("-reg_date")
    .select("reg_date")
    if(!max_date) return res.status(404).send('No data available')

    const result=await Chemical_Agent.find({reg_date:max_date.reg_date})
    .select("sensor uid -_id types value lat long")

    if(result.length>0)
        res.status(200).send(result)
    else
        res.status(404).send('No data available')
  
})


/** 
* @swagger
* /chemical_agents/current/:station_id :
*  get:
*    tags: [Chemical_Agents]
*    parameters:
*       - name: station_id
*         description: String that represents the uid of the sensor used by the aqi api
*         in: formData
*         required: true
*         type: String
*    description: Use to get all current data from a station (latest available)
*    responses:
*       '200':
*         description: A successful response, data available return an array of object
*         schema:
*           type: object
*           properties:
*               sensor:
*                   type: string
*               reg_data:
*                   type: string
*                   format: date-time
*               uid:
*                   type: string
*               types:
*                   type: string
*                   enum:
*                       O3
*                       NO
*                       NO2
*                       NOX
*                       PM10
*                       PM25
*                       BENZENE
*                       CO
*                       SO2
*               value:
*                   type: number
*                   format: float
*                   example: 70.4
*               lat:
*                   type: string
*               long:
*                   type: string
*               type: object
*       '400' :
*         description: Bad request/Invalid token provided
*       '401':
*         description: User is not logged in... user has to authenticate himself
*/

router.get('/current/:station_id' , auth, async (req,res) => {
    let par=req.params.station_id

    const max_date= await Chemical_Agent.findOne()
    .sort("-reg_date")
    .select("reg_date")

    if(!max_date)  res.status(404).send('No data available')

    const result=await Chemical_Agent.find({reg_date:max_date.reg_date,uid:par})
    .select("sensor uid -_id types value lat long")

    if(result.length>0) 
        res.status(200).send(result)
    else
        res.status(404).send("No data with the given criteria")
})


/** 
* @swagger
* /chemical_agents/filter/date/:date_start/:date_end :
*  get:
*    tags: [Chemical_Agents]
*    description: Use to request all chemical data from all sensor registred in a day between date_start and date_end
*    parameters:
*       - name: date_start
*         description: upper date bound format must be YYYY/MM/DD
*         in: formData
*         required: true
*         type: date
*       - name: date_end
*         description: lower date bound format must be YYYY/MM/DD
*         in: formData
*         required: true
*         type: date
*    responses:
*       '200':
*         description: A successful response, data available return an array of object
*         schema:
*           type: object
*           properties:
*               sensor:
*                   type: string
*               reg_data:
*                   type: string
*                   format: date-time
*               uid:
*                   type: string
*               types:
*                   type: string
*                   enum:
*                       O3
*                       NO
*                       NO2
*                       NOX
*                       PM10
*                       PM25
*                       BENZENE
*                       CO
*                       SO2
*               value:
*                   type: number
*                   format: float
*                   example: 70.4
*               lat:
*                   type: string
*               long:
*                   type: string
*               type: object
*       '400' :
*         description: Bad request/Invalid token provided
*       '401':
*         description: User is not logged in... user has to authenticate himself
*       '403':
*         description: User is not an operator or admin
*/


router.get('/filter/date/:date_start/:date_end', [auth, operator], async (req,res) => {

    const date_start = new Date(req.params.date_start)
    const date_stop = new Date(req.params.date_end)
    if(validateDate(date_start) && validateDate(date_stop)){
    date_start.setHours("0")
    date_start.setMinutes("1")
    date_stop.setHours("23")
    date_stop.setMinutes("59")
    const result = await Chemical_Agent.find({reg_date: {'$gte': date_start, '$lt': date_stop}})
    .select("sensor uid -_id value types lat long")
    .sort("uid")
    if(result.length>0) res.status(200).send(result)
   else res.status(404).send("No data with the given criteria")
    }else{
        res.status(400).send("Bad request")
    }
})




/** 
* @swagger
* /chemical_agents/filter/date/:station_id/:date_start/:date_end :
*  get:
*    tags: [Chemical_Agents]
*    description: Use to request all chemical data from a sensor registred in a day between date_start and date_end
*    parameters:
*  
*       - name: station_id
*         description: uid of the station
*         in: formData
*         required: true
*         type: string

*       - name: date_start
*         description: upper date bound format must be YYYY/MM/DD
*         in: formData
*         required: true
*         type: date
*       - name: date_end
*         description: lower date bound format must be YYYY/MM/DD
*         in: formData
*         required: true
*         type: date
*    responses:
*       '200':
*         description: A successful response, data available return an array of object
*         schema:
*           type: object
*           properties:
*               sensor:
*                   type: string
*               reg_data:
*                   type: string
*                   format: date-time
*               uid:
*                   type: string
*               types:
*                   type: string
*                   enum:
*                       O3
*                       NO
*                       NO2
*                       NOX
*                       PM10
*                       PM25
*                       BENZENE
*                       CO
*                       SO2
*               value:
*                   type: number
*                   format: float
*                   example: 70.4
*               lat:
*                   type: string
*               long:
*                   type: string
*               type: object
*       '400' :
*         description: Bad request/Invalid token provided
*       '401':
*         description: User is not logged in... user has to authenticate himself
*       '403':
*         description: User is not an operator or admin
*       '404' :
*         description: No data with the given criteria
*/
router.get('/filter/date/:station_id/:date_start/:date_end', [auth, operator], async (req,res) => {
  
    const date_start = new Date(req.params.date_start)
    const date_stop = new Date(req.params.date_end)
    if(validateDate(date_start) && validateDate(date_stop)){
    date_start.setHours("0")
    date_start.setMinutes("1")
    date_stop.setHours("23")
    date_stop.setMinutes("59")
    // proviamo
    const id_s=req.params.station_id
    const result = await Chemical_Agent.find({uid:id_s,reg_date: {'$gte': date_start, '$lte': date_stop}})
    .select(" reg_date sensor uid -_id value types lat long")
    .sort("uid")
    if(result.length>0)res.status(200).send(result)
   else  res.status(404).send("No data with the given criteria")
    }else
    {
        res.status(400).send("Bad request")
    }
 
})


/** 
* @swagger
* /chemical_agents/filter/date/:date_start/:date_end/:type :
*  get:
*    tags: [Chemical_Agents]
*    description: Use to request all chemical data from a sensor registred in a day between date_start and date_end of a kind of chemical agents
*    parameters:
*  
*       - name: station_id
*         description: uid of the station
*         in: formData
*         required: true
*         type: string

*       - name: date_start
*         description: upper date bound format must be YYYY/MM/DD
*         in: formData
*         required: true
*         type: date
*       - name: date_end
*         description: lower date bound format must be YYYY/MM/DD
*         in: formData
*         required: true
*         type: date
*       - name: type
*         description: the name of chemical agents
*         in: formData
*         required: true
*         type: date
*    responses:
*       '200':
*         description: A successful response, data available return an array of object
*         schema:
*           type: object
*           properties:
*               sensor:
*                   type: string
*               reg_data:
*                   type: string
*                   format: date-time
*               uid:
*                   type: string
*               types:
*                   type: string
*                   enum:
*                       O3
*                       NO
*                       NO2
*                       NOX
*                       PM10
*                       PM25
*                       BENZENE
*                       CO
*                       SO2
*               value:
*                   type: number
*                   format: float
*                   example: 70.4
*               lat:
*                   type: string
*               long:
*                   type: string
*               type: object
*       '400' :
*         description: Bad request/Invalid token provided
*       '401':
*         description: User is not logged in... user has to authenticate himself
*       '403':
*         description: User is not an operator or admin
*       '404' :
*         description: No data with the given criteria
*/
router.get('/filter/date/:date_start/:date_end/type/:type', [auth, operator], async (req,res) => {
  
    const date_start = new Date(req.params.date_start)
    const date_stop = new Date(req.params.date_end)
    if(validateDate(date_start) && validateDate(date_stop)){
    date_start.setHours("0")
    date_start.setMinutes("1")
    date_stop.setHours("23")
    date_stop.setMinutes("59")
    const result = await Chemical_Agent.find({types:(req.params.type.toUpperCase()),reg_date: {'$gte': date_start, '$lte': date_stop}})
    .select(" reg_date sensor uid -_id value types lat long")
    .sort("uid")

    if(result.length>0)res.status(200).send(result)
   else  res.status(404).send("No data with the given criteria")
    }else
    {
        res.status(400).send("Bad request")
    }
 
})
/** 
* @swagger
* /chemical_agents/filter/date/:date_start/:date_end/:type/:station_id :
*  get:
*    tags: [Chemical_Agents]
*    description: Use to request all chemical data from a sensor registred in a day between date_start and date_end of a kind of chemical agents of a station
*    parameters:
*  
*       - name: station_id
*         description: uid of the station
*         in: formData
*         required: true
*         type: string

*       - name: date_start
*         description: upper date bound format must be YYYY/MM/DD
*         in: formData
*         required: true
*         type: date
*       - name: date_end
*         description: lower date bound format must be YYYY/MM/DD
*         in: formData
*         required: true
*         type: date
*       - name: type
*         description: the name of chemical agents
*         in: formData
*         required: true
*         type: date
*    responses:
*       '200':
*         description: A successful response, data available return an array of object
*         schema:
*           type: object
*           properties:
*               sensor:
*                   type: string
*               reg_data:
*                   type: string
*                   format: date-time
*               uid:
*                   type: string
*               types:
*                   type: string
*                   enum:
*                       O3
*                       NO
*                       NO2
*                       NOX
*                       PM10
*                       PM25
*                       BENZENE
*                       CO
*                       SO2
*               value:
*                   type: number
*                   format: float
*                   example: 70.4
*               lat:
*                   type: string
*               long:
*                   type: string
*               type: object
*       '400' :
*         description: Bad request/Invalid token provided
*       '401':
*         description: User is not logged in... user has to authenticate himself
*       '403':
*         description: User is not an operator or admin
*       '404' :
*         description: No data with the given criteria
*/
router.get('/filter/date/:date_start/:date_end/type/:type/:station_id', [auth, operator], async (req,res) => {
  
    const date_start = new Date(req.params.date_start)
    const date_stop = new Date(req.params.date_end)
    if(validateDate(date_start) && validateDate(date_stop)){
    date_start.setHours("0")
    date_start.setMinutes("1")
    date_stop.setHours("23")
    date_stop.setMinutes("59")
    const id_s=req.params.station_id
    const result = await Chemical_Agent.find({uid:id_s,types:(req.params.type.toUpperCase()),reg_date: {'$gte': date_start, '$lte': date_stop}})
    .select(" reg_date sensor uid -_id value types lat long")
    .sort("uid")
    if(result.length>0)res.status(200).send(result)
   else  res.status(404).send("No data with the given criteria")
    }else
    {
        res.status(400).send("Bad request")
    }
 
})




/** 
* @swagger
* /chemical_agents/filter/avg/:station_id/:type :
*  get:
*    tags: [Chemical_Agents]
*    description: Use to request the average of an agents of a sensor
*    parameters:
*       - name: station_id
*         description: id of the station
*         in: formData
*         required: true
*         type: String
*       - name: type
*         description: Represents the type of the chemical agent tha you are looking for it must be ['O3','NO','NO2','NOX','PM10','PM25','BENZENE','CO','SO2']
*         in: formData
*         required: true
*         type: String
*    responses:
*       '200':
*         description: A successful response, data available return an object
*         schema:
*           type: object
*           properties:
*               value:
*                   type: number
*                   format: float
*                   example: 27.3
*               type: object
*       '400' :
*         description: Bad request/Invalid token provided
*       '401':
*         description: User is not logged in... user has to authenticate himself
*       '403':
*         description: User is not an operator or admin
*       '404' :
*         description: No data available
*/

router.get('/filter/avg/:station_id/:type', [auth, operator], async (req,res) => {
    
    let par1=req.params.station_id
    let par2=req.params.type.toUpperCase()
  
    let ind=Object.values(Agents).indexOf(par2)
    if(ind>-1)
    {
        const result=await Chemical_Agent.find({uid:par1,types:par2})
        .sort("-reg_date")
        if(result.length>0)
        {
            let i=0;
            let sum=0;
            let len=result.length
            for(i=0;i<len;i++)
            {
               // console.log(result[i].value)
                sum+=result[i].value
                
            }
            //console.log(sum)
            let avg=(sum/result.length)
            
            let obj={value:avg}
            res.status(200).send(obj)
        } 
        else{
            res.status(404).send("NOT FOUND")
        }
            
        
    }else
    
    res.status(400).send("Bad Request")
    
   
})


/** 
* @swagger
* /chemical_agents/filter/avg/:station_id:
*  get:
*    tags: [Chemical_Agents]
*    description: Use to request the average of all agents of a sensor (history)
*    parameters:
*       - name: station_id
*         description: id of the station
*         in: formData
*         required: true
*         type: String
*    responses:
*       '200':
*         description: A successful response, data available return an array of object
*         schema:
*           type: object
*           properties:
*               types:
*                   type: string
*                   enum:
*                       O3
*                       NO
*                       NO2
*                       NOX
*                       PM10
*                       PM25
*                       BENZENE
*                       CO
*                       SO2
*               value:
*                   type: number
*                   format: float
*                   example: 70.4
*               
*               type: object
*       '404' :
*         description: No data available
*       '400' :
*         description: Invalid token provided
*       '401':
*         description: User is not logged in... user has to authenticate himself
*/

router.get('/filter/avg/:station_id', auth, async (req,res) => {
    let par1=req.params.station_id
    const result=await Chemical_Agent.find({uid:par1})
    .sort("-reg_date")
    if(result.length>0)
    {
        let i=0;
        let sum=[0.0,0.0,0.0,0.0,0.0,0.0]
        let cont=[0,0,0,0,0,0]
        let len=result.length
        for(i=0;i<len;i++)
        {
           // console.log(result[i].types+ "->"+result[i].value)
            if(result[i].types==Agents.CO){
                sum[0]+=result[i].value
                cont[0]+=1
            }
            if(result[i].types==Agents.SO2)
            {
                sum[1]+=result[i].value
                cont[1]+=1
            }

            if(result[i].types==Agents.PM10)
            {
                sum[2]+=result[i].value
                cont[2]+=1
            }

            if(result[i].types==Agents.PM25)
            {
                sum[3]+=result[i].value
                cont[3]+=1
            }
            if(result[i].types==Agents.O3)
            {
                sum[4]+=result[i].value
                cont[4]+=1
            }
        }

        let obj=[
       {
        types:"CO",
        avg:(sum[0]/cont[0])
       },
       {
        types:"SO2",
        avg: (sum[1]/cont[1])
       },
       {
        types:"PM10",
        avg:(sum[2]/cont[2])
       },
       {
        types:"PM25",
        avg:(sum[3]/cont[3])
       },
       {
        types:"O3",
        avg:(sum[4]/cont[4])
       }
       
        ]
            
        //console.log(obj)
        
       
        res.status(200).send(obj)
    }   
    else{
        res.status(404).send("NOT FOUND")
        }  
   
})

/** 
* @swagger
* /chemical_agents/history :
*  get:
*    tags: [Chemical_Agents]
*    description: Use to request all chemical data from all sensor 
*
*    responses:
*       '200':
*         description: A successful response, data available return an array of object
*         schema:
*           type: object
*           properties:
*               sensor:
*                   type: string
*               reg_data:
*                   type: string
*                   format: date-time
*               uid:
*                   type: string
*               types:
*                   type: string
*                   enum:
*                       O3
*                       NO
*                       NO2
*                       NOX
*                       PM10
*                       PM25
*                       BENZENE
*                       CO
*                       SO2
*               value:
*                   type: number
*                   format: float
*                   example: 70.4
*               lat:
*                   type: string
*               long:
*                   type: string
*               type: object
*       '400' :
*         description: Bad request/Invalid token provided
*       '401':
*         description: User is not logged in... user has to authenticate himself
*       '403':
*         description: User is not an operator or admin
*/

//should return history of all data 
router.get('/history', [auth, operator], async (req,res) => {
 const result=await Chemical_Agent.find()
 .sort("-reg_date")
 .select("reg_date sensor uid types value -_id lat long")
if(result.length>0) 
    res.status(200).send(result)  
else
    res.status(400).send("Data not available")
})


/** 
* @swagger
* /chemical_agents/history/:type :
*  get:
*    tags: [Chemical_Agents]
*    description: Use to request all chemical data about an agent from all sensor 
*    parameters:
*       - name: type
*         description: Represents the type of the chemical agent tha you are looking for it must be ['O3','NO','NO2','NOX','PM10','PM25','BENZENE','CO','SO2']
*         in: formData
*         required: true
*         type: String
*  
*    responses:
*       '200':
*         description: A successful response, data available return an array of object
*         schema:
*           type: object
*           properties:
*               sensor:
*                   type: string
*               reg_data:
*                   type: string
*                   format: date-time
*               uid:
*                   type: string
*               types:
*                   type: string
*                   enum:
*                       O3
*                       NO
*                       NO2
*                       NOX
*                       PM10
*                       PM25
*                       BENZENE
*                       CO
*                       SO2
*               value:
*                   type: number
*                   format: float
*                   example: 70.4
*               lat:
*                   type: string
*               long:
*                   type: string
*               type: object
*       '400' :
*         description: Bad request/Invalid token provided
*       '401':
*         description: User is not logged in... user has to authenticate himself
*       '403':
*         description: User is not an operator or admin
*       '404' :
*         description: No data available
*/


router.get('/history/:type', [auth, operator], async (req,res) => {
    let par=req.params.type.toUpperCase()
    let ind=Object.values(Agents).indexOf(par)
    if(ind>-1)
    {
    const result=await Chemical_Agent.find({types:par})
    .sort("-reg_date")
    .select("reg_date sensor uid types value -_id lat long")

    if(result.length>0)
         res.status(200).send(result)
    else
        res.status(404).send('No data available')
     
    }else{

        res.status(400).send("Bad request")
    }
   })


/** 
* @swagger
* /chemical_agents/history/station/:station_id :
*  get:
*    tags: [Chemical_Agents]
*    description: Use to request all chemical data from a station 
*    parameters:
*       - name: station_id
*         description: String that represents the uid of the sensor used by the aqi api
*         in: formData
*         required: true
*         type: String
*  
*    responses:
*       '200':
*         description: A successful response, data available return an array of object
*         schema:
*           type: object
*           properties:
*               sensor:
*                   type: string
*               reg_data:
*                   type: string
*                   format: date-time
*               uid:
*                   type: string
*               types:
*                   type: string
*                   enum:
*                       O3
*                       NO
*                       NO2
*                       NOX
*                       PM10
*                       PM25
*                       BENZENE
*                       CO
*                       SO2
*               value:
*                   type: number
*                   format: float
*                   example: 70.4
*               lat:
*                   type: string
*               long:
*                   type: string
*               type: object
*       '404' :
*         description: Not found
*       '400' :
*         description: Invalid token provided
*       '401':
*         description: User is not logged in... user has to authenticate himself
*       '403':
*         description: User is not an operator or admin
*/

   router.get('/history/station/:station_id', [auth, operator], async (req,res) => {
    let par=req.params.station_id

    
    const result=await Chemical_Agent.find({uid:par})
    .sort("-reg_date")
    .select("reg_date sensor uid types value -_id lat long")  
    if(result.length>0)
        res.status(200).send(result)
    else
        res.status(404).send("Data not available")
   })


   /** 
* @swagger
* /chemical_agents/history/station/:station_id/:type :
*  get:
*    tags: [Chemical_Agents]
*    description: Use to request all chemical data about an agent from a station 
*    parameters:
*       - name: station_id
*         description: String that represents the uid of the sensor used by the aqi api
*         in: formData
*         required: true
*         type: String
*          
*       - name: type
*         description: Represents the type of the chemical agent tha you are looking for it must be ['O3','NO','NO2','NOX','PM10','PM25','BENZENE','CO','SO2']
*         in: formData
*         required: true
*         type: String
    
*  
*    responses:
*       '200':
*         description: A successful response, data available return an array of object
*         schema:
*           type: object
*           properties:
*               sensor:
*                   type: string
*               reg_data:
*                   type: string
*                   format: date-time
*               uid:
*                   type: string
*               types:
*                   type: string
*                   enum:
*                       O3
*                       NO
*                       NO2
*                       NOX
*                       PM10
*                       PM25
*                       BENZENE
*                       CO
*                       SO2
*               value:
*                   type: number
*                   format: float
*                   example: 70.4
*               lat:
*                   type: string
*               long:
*                   type: string
*               type: object
*       '404' :
*         description: Not found
*       '400':
*         description: Bad Request/Invalid token provided
*       '401':
*         description: User is not logged in... user has to authenticate himself
*       '403':
*         description: User is not an operator or admin
*/
   //return history data of an station id and of a kind of data
   router.get('/history/station/:station_id/:type', [auth, operator], async (req,res) => {
    let par1=req.params.station_id
    let par2=req.params.type.toUpperCase()
  
    let ind=Object.values(Agents).indexOf(par2)
    if(ind>-1)
    {
        const result=await Chemical_Agent.find({uid:par1,types:par2})
        .sort("-reg_date")
        .select("reg_date sensor uid types value -_id lat long")  
        if(result.length>0)
            res.status(200).send(result) 
        else
            res.status(404).send("NOT FOUND")
        
    }else
    
    res.status(400).send("Bad Request")
    
   
   })

/*
   //should return data between hour_start and hour_end in a day
   router.get('/filter/hour/:date/:hour_start/:hour_end', async (req,res) => {

    if(req.params.hour_start>24 || req.params.hour_start<0 ||req.params.hour_end>24 || req.params.hour_end<0 )
        {
            res.status(400).send('Bad Request')
        }
    else{

    let date_start = new Date(req.params.date)
    let date_stop= new Date(req.params.date)
    date_start.setHours(req.params.hour_start)
    date_stop.setHours(req.params.hour_end)
    let ds=date_start.toUTCString()
    let de=date_stop.toUTCString()

    let dsf=new Date(ds)
    let def=new Date(de)
  
    console.log(dsf+ '-> '+def)
    const result = await Chemical_Agent.find({reg_date: {'$gte': date_start, '$lte': date_stop}})
    .select("sensor uid -_id value types reg_date")
    .sort("uid")
    if (!result) return res.status(404).send('No chemical data match the given criteria')
    res.status(200).send(result)
    }
})

*/

    





module.exports = router