const express = require('express')
const {Agents,Chemical_Agent,validate}=require('../models/chemical_agents')
const moment=require('moment')
const router = express.Router()


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
*         description: A successful response, data available
*       '404':
*         description: No data available
*/

router.get('/' , async (req,res) => {

    const max_date= await Chemical_Agent.findOne()
    .sort("-reg_date")
    .select("reg_date")
    if(!max_date) return res.status(404).send('No data available')

    const result=await Chemical_Agent.find({reg_date:max_date.reg_date})
    .select("sensor uid -_id types value lat long")

    if(!result.length)
    res.status(404).send('No data available')
    else
    res.status(200).send(result)
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
*         description: A successful response
*       '400' :
*         description: Bad request
*/

router.get('/current/:station_id' , async (req,res) => {
    let par=req.params.station_id

    const max_date= await Chemical_Agent.findOne()
    .sort("-reg_date")
    .select("reg_date")

    if(!max_date)  res.status(404).send('No data available')

    const result=await Chemical_Agent.find({reg_date:max_date.reg_date,uid:par})
    .select("sensor uid -_id types value lat long")

    if(!result.length) res.status(404).send("No data with the given criteria")
    else
    res.status(200).send(result)
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
*         description: A successful response
*       '400' :
*         description: Bad request
*/


router.get('/filter/date/:date_start/:date_end', async (req,res) => {

    const date_start = new Date(req.params.date_start)
    const date_stop = new Date(req.params.date_end)
    const result = await Chemical_Agent.find({reg_date: {'$gte': date_start, '$lt': date_stop}})
    .select("sensor uid -_id value types lat long")
    .sort("uid")
    if(!result.length) res.status(404).send("No data with the given criteria")
   else res.status(200).send(result)
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
*         description: A successful response
*       '400' :
*         description: Bad request
*       '404' :
*         description: No data available
*/

router.get('/filter/avg/:station_id/:type', async (req,res) => {
    
    let par1=req.params.station_id
    let par2=req.params.type.toUpperCase()
  
    let ind=Object.values(Agents).indexOf(par2)
    if(ind>-1)
    {
        const result=await Chemical_Agent.find({uid:par1,types:par2})
        .sort("-reg_date")
        if(!result.length)
            res.status(404).send("NOT FOUND")
        else{
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
            
        
    }else
    
    res.status(400).send("Bad Request")
    
   
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
*         description: A successful response
*       '400' :
*         description: Bad request
*/

//should return history of all data 
router.get('/history', async (req,res) => {
 const result=await Chemical_Agent.find()
 .sort("-reg_date")
 .select("reg_date sensor uid types value -_id lat long")
if(!result.length) 
    res.status(400).send("Data not available")
else
    res.status(200).send(result)
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
*         description: A successful response
*       '400' :
*         description: Bad request
*       '404' :
*         description: No data available
*/


router.get('/history/:type', async (req,res) => {
    let par=req.params.type.toUpperCase()
    let ind=Object.values(Agents).indexOf(par)
    if(ind>-1)
    {
    const result=await Chemical_Agent.find({types:par})
    .sort("-reg_date")
    .select("reg_date sensor uid types value -_id lat long")

    if(!result.length)
        res.status(404).send('No data available')
    else
     res.status(200).send(result)
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
*         description: A successful response
*       '404' :
*         description: Not found
*/

   router.get('/history/station/:station_id', async (req,res) => {
    let par=req.params.station_id

    
    const result=await Chemical_Agent.find({uid:par})
    .sort("-reg_date")
    .select("reg_date sensor uid types value -_id lat long")  
    if(!result.length)
        res.status(404).send("Data not available")
    else
        res.status(200).send(result)
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
*         description: A successful response
*       '404' :
*         description: Not found
*       '400':
*         description: Bad Request 
*/
   //return history data of an station id and of a kind of data
   router.get('/history/station/:station_id/:type', async (req,res) => {
    let par1=req.params.station_id
    let par2=req.params.type.toUpperCase()
  
    let ind=Object.values(Agents).indexOf(par2)
    if(ind>-1)
    {
        const result=await Chemical_Agent.find({uid:par1,types:par2})
        .sort("-reg_date")
        .select("reg_date sensor uid types value -_id lat long")  
        if(!result.length)
            res.status(404).send("NOT FOUND")
        else
            res.status(200).send(result)
        
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