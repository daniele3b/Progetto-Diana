const jwt = require('jsonwebtoken')
const {User} = require('../../models/user')
const {calculateCF} = require('../../helper/registration_helper')

require('dotenv').config()

// WORK IN PROGRESS

describe('generateAuthToken', () => {
    it('should return a valid JasonWebToken', () => {
        const payload = {
            CF: calculateCF('Ivan', 'Giacomoni', 'M', '31', '05', '1998', 'Latina'), 
            type: 'operatore' 
        }

        const user = new User(payload)
        const token = user.generateAuthToken()
        const decoded = jwt.verify(token, process.env.DIANA_TOKEN_KEY)

        console.log("decoded.CF="+decoded.CF)
        console.log("payload.CF="+payload.CF)

        //expect(decoded.CF).toBe(payload.CF)   // TO DO..
        expect(decoded.type).toBe(payload.type)
    })
})