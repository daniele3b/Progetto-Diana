const {addressOK, radiusOK, getLatLong, getSensorsInfo, getResultsAndDestinationsForDistances} 
    = require('../../helper/traffic_helper')

jest.setTimeout(60000)

describe('addressOK', () => {
    it("should return true if address doesn't contain numbers", () => {
        const res = addressOK('Viale Della Vittoria, Terracina')
        expect(res).toBe(true)
    })

    it("should return false if array contains numbers", () => {
        const res = addressOK('Viale Della Vittoria, Terracina, 7')
        expect(res).toBe(false)
    })
})

describe('radiusOk', () => {
    it('should return true if radius is an integer number > 0', () => {
        const res = radiusOK('50')
        expect(res).toBe(true)      
    })
    
    it('should return true if radius is a decimale number > 0', () => {
        const res = radiusOK('34.78')
        expect(res).toBe(true)    
    })

    it('should return true if radius is a negative number', () => {
        // Result is true because i check the sign with another control in traffic.js
        // to give the client a different error message
        
        const res1 = radiusOK('-2')
        expect(res1).toBe(true)
        
        const res2 = radiusOK('-2.6')
        expect(res2).toBe(true)
    })

    it('should return false if radius is not a number', () => {
        const res = radiusOK('prova45prova')
        expect(res).toBe(false)    
    })

    it("should return false if char '.' is at the beginning or at the ending of input", () => {
        const res1 = radiusOK('.56')
        expect(res1).toBe(false)
        
        const res2 = radiusOK('45.')
        expect(res2).toBe(false)   
    })

    it("should return false if char '.' appears more than once in input", () => {
        const res = radiusOK('43.5.67')
        expect(res).toBe(false)    
    })
})

describe('getLatLong', () => {
    it('should return a resolved promise with geographical coordinates for the given address if address is valid', async () => {
        const res = await getLatLong('Via Tiburtina')
        expect(res).toBeTruthy()
        expect(res.length).toBe(2)
    })

    it('should return a resolved promise with -1 if address is not an existing address', async () => {
        // NO ADDRESS
        
        const res = await getLatLong('xxxxxxxxxxxxxxxxxxx')

        expect(res).toBe(-1)
    })

    it('should return a rejected promise if address is not relative to a way', async () => {
        // ECUADROR SUPERMARKET :)
        
        const res = await getLatLong('xxxxxxxxxxxxxxxxxxxxxxxx')
        expect(res).toBe(-1)
    })
})

describe('getSensorsInfo', () => {
    it('should return info about sensors in the result', () => {
        const res = getSensorsInfo(
            [
                {
                    sensor: "Cinecitta', Roma, Lazio, Italy",
                    uid: '9343',
                    lat: '41.8482263',
                    long: '12.5759027'
                },
                {
                    sensor: 'Malagrotta, Roma, Lazio, Italy',
                    uid: '9349',
                    lat: '41.883706',
                    long: '12.3337009'
                },
                {
                    sensor: 'Fiumicino Villa Guglielmi, Roma, Lazio, Italy',
                    uid: '10911',
                    lat: '41.7702662',
                    long: '12.2366768'
                }
            ]
        )

        expect(res).toBeTruthy()
    })
})


describe('getResultsAndDestinationsForDistances', () => {
    it('should return info for distances', async () => {
        const res = await getResultsAndDestinationsForDistances(
            [
                { lat: '41.8482263', lon: '12.5759027' },
                { lat: '41.883706', lon: '12.3337009' },
                { lat: '41.7702662', lon: '12.2366768' },
                { lat: '41.9363397', lon: '12.6544146' },
                { lat: '41.9644063', lon: '12.6684397' },
                { lat: '41.9328321', lon: '12.5012473' },
                { lat: '41.9939694', lon: '12.7245045' },
                { lat: '41.8932669', lon: '12.4753855' },
                { lat: '41.9071831', lon: '12.4466876' },
                { lat: '41.9248746', lon: '12.4934413' },
                { lat: '41.7272528', lon: '13.0037837' }
            ], '41.9336838', '12.6033235'
        )

        expect(res).toBeTruthy()
    })
})
