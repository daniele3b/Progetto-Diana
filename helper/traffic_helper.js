const config = require('config')
const request = require('request')

require('dotenv').config()


function search (arr, elem) {
    let i
    const dim = arr.length
    for(i=0;i<dim;i++){
        if(arr[i] == elem) return true
    }
    return false
}

function addressOK (str) {
    const dim = str.length
    let i
    for(i=0;i<dim;i++) {
        if(!isNaN(parseInt(str[i]))) return false
    }
    return true
}

function radiusOK (str) {
    const dim = str.length
    let i = 0
    counter = 0
    if(str[0] == '-') i = 1
    if(str[0] == '.' || str[dim-1] == '.') return false
    for(;i<dim;i++) {
        if((str[i] == '.') && counter == 1){
            return false
        }
        if( (str[i] == '.') && counter == 0){
            counter += 1
            continue
        } 
        if(isNaN(parseInt(str[i]))) return false
    }
    return true
}

function getLatLong (address) {
    
    // I return a Promise because in the traffic route i make a call to this function, which executes an HTTP request,
    // and this request is slower than the end of the function itself.. So i have to await the result
    // (in this case the coordinates) and than i can use it in the traffic route 
    
    return new Promise(function(resolve, reject) {
        let pick_point_end_url = config.get('pick_point_end');

        const size = address.length
        let parsed = ''
        for(let i=0;i<size;i++){
            if(address[i] == ' ') parsed += "%20"
            else parsed += address[i]
        }
    
        // https://api.pickpoint.io/v1/forward/?key=process.env.ADDRESS&q=parsed&limit=1&format=json
    
        // I used 'limit=1' because this API call returns an array of options for my request: so, in this case,
        // i'll take an array of one element

        const url_addr = pick_point_end_url+'/?key='+process.env.ADDRESS+'&q='+parsed+"&limit=1&format=json"

        request(url_addr, function(error, response, body) {
            const parsed_body = JSON.parse(body)

            if(error){
                logger.error('T2: Impossible to get coordinates for the address: '+address)
                console.log('T2') 
                reject(error)
            }
            else if( parsed_body.length == 0 ) {
                reject(error)
            }
            else if(parsed_body[0].class != 'highway') {
                reject(error)
            }
            else{
                const lat = parsed_body[0].lat
                const lon = parsed_body[0].lon
                resolve([lat, lon])
            }
        })
    })   
}

/*function getSensorsInfo (result) {
    return new Promise(function(resolve, reject) {
        let sensors = []
        let uids = []
        let coordinates = []

        let i
        const dim = result.length
        for(i=0;i<dim;i++){
            if(!search(uids, result[i].uid)){
                uids.push(result[i].uid)
                sensors.push(result[i].sensor)
                coordinates.push({lat : result[i].lat, lon : result[i].long})
            }
        }
        resolve({
            sensors: sensors,
            uids: uids,
            coordinates: coordinates
        })
    })
}*/

function getSensorsInfo (result) {
    let sensors = []
    let uids = []
    let coordinates = []

    let i
    const dim = result.length
    for(i=0;i<dim;i++){
        if(!search(uids, result[i].uid)){
            uids.push(result[i].uid)
            sensors.push(result[i].sensor)
            coordinates.push({lat : result[i].lat, lon : result[i].long})
        }
    }
    
    return {
        sensors: sensors,
        uids: uids,
        coordinates: coordinates
    }
}

function getResultsAndDestinationsForDistances(coordinates, lat, lon) {
    return new Promise(function(resolve, reject) {
        const bing_maps_end = config.get('bing_maps_end')
        let bing_maps_end_url = bing_maps_end+'?origins='+lat+','+lon+'&destinations='

        const size = coordinates.length
        for(i=0;i<size;i++) {
            bing_maps_end_url += coordinates[i].lat+','+coordinates[i].lon
            if(i != size - 1) bing_maps_end_url += ';'
        }
                
        bing_maps_end_url += '&travelMode=driving&distanceUnit=km&key='+process.env.DISTANCE

        request(bing_maps_end_url, function(error, response, body) {
            if(error) {
                logger.error('T3: Impossible to get info about distances')
                console.log('T3')
                reject(error)
            }

            else {
                const parsed_body = JSON.parse(body)
                const results = parsed_body.resourceSets[0].resources[0].results
                const destinations = parsed_body.resourceSets[0].resources[0].destinations
                resolve({
                    results: results,
                    destinations: destinations
                })
            }
        })
    })
}

exports.search = search
exports.addressOK = addressOK
exports.radiusOK = radiusOK
exports.getLatLong = getLatLong
exports.getSensorsInfo = getSensorsInfo
exports.getResultsAndDestinationsForDistances = getResultsAndDestinationsForDistances