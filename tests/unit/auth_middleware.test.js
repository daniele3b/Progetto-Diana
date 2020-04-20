const {User} = require('../../models/user');
const auth = require('../../middleware/auth');
const admin = require('../../middleware/admin')
const operator = require('../../middleware/operator')
const {calculateCF} = require('../../helper/registration_helper')

describe('auth', () => {
    it('should fill req.user with the payload of a valide JWT', () => {
        const user = {
            CF: calculateCF('Ivan', 'Giacomoni', 'M', '31', '05', '1998', 'Latina'), 
            type: 'operatore'
        };
        const token = new User(user).generateAuthToken()
        const req = {
            header: jest.fn().mockReturnValue(token)
        };
        const res = {}
        const next = jest.fn()

        auth(req, res, next)
    
        expect(req.user.CF).toMatch(user.CF.code)
        expect(req.user.type).toMatch(user.type)
    })
})

// WORK IN PROGRESS

/*
describe('admin', () => {
    
    it('should return 403 if user is a citizen', () => {
        const user = {
            CF: calculateCF('Ivan', 'Giacomoni', 'M', '31', '05', '1998', 'Latina'), 
            type: 'cittadino'
        };
        const token = new User(user).generateAuthToken()
        const req = {
            header: jest.fn().mockReturnValue(token)
        };
        const res = {}
        const next = jest.fn()

        auth(req, res, next)

        expect(res.status).toBe(403)
    })

    it('should return 403 if user is an operator', () => {
        const user = {
            CF: calculateCF('Ivan', 'Giacomoni', 'M', '31', '05', '1998', 'Latina'), 
            type: 'operatore'
        };
        const token = new User(user).generateAuthToken()
        const req = {
            header: jest.fn().mockReturnValue(token)
        };
        const res = {}
        const next = jest.fn()

        auth(req, res, next)

        expect(res.status).toBe(403)
    })

    it('should pass control to the next middleware function if user is an admin', () => {
        const user = {
            CF: calculateCF('Ivan', 'Giacomoni', 'M', '31', '05', '1998', 'Latina'), 
            type: 'admin'
        };
        const token = new User(user).generateAuthToken()
        const req = {
            header: jest.fn().mockReturnValue(token)
        };
        const res = {}
        const next = jest.fn()

        auth(req, res, next)

        expect(res.status).toBe(403)
    })
})

describe('operator', () => {
    
    it('should return 403 if user is a citizen', () => {
        const user = {
            CF: calculateCF('Ivan', 'Giacomoni', 'M', '31', '05', '1998', 'Latina'), 
            type: 'cittadino'
        };
        const token = new User(user).generateAuthToken()
        const req = {
            header: jest.fn().mockReturnValue(token)
        };
        const res = {}
        const next = jest.fn()

        auth(req, res, next)

        expect(res.status).toBe(403)
    })

    it('should pass control to the next middleware function if user is an operator', () => {
        const user = {
            CF: calculateCF('Ivan', 'Giacomoni', 'M', '31', '05', '1998', 'Latina'), 
            type: 'operatore'
        };
        const token = new User(user).generateAuthToken()
        const req = {
            header: jest.fn().mockReturnValue(token)
        };
        const res = {}
        const next = jest.fn()

        auth(req, res, next)

        expect(next).toBeCalled()
    })

    it('should pass control to the next middleware function if user is an admin', () => {
        const user = {
            CF: calculateCF('Ivan', 'Giacomoni', 'M', '31', '05', '1998', 'Latina'), 
            type: 'admin'
        };
        const token = new User(user).generateAuthToken()
        const req = {
            header: jest.fn().mockReturnValue(token)
        };
        const res = {}
        const next = jest.fn()

        auth(req, res, next)

        expect(next).toBeCalled()
    })
})*/