const {User} = require('../../models/user');
const auth = require('../../middleware/auth');
const {calculateCF} = require('../../helper/registration_helper')

describe('auth midlleware', () => {
    it('should fill req.user with the payload of a valide JWT', () => {
        const user = {
            CF: calculateCF('Ivan', 'Giacomoni', 'M', '31', '05', '1998', 'Latina'), 
            type: 'operatore'
        };
        const token = new User(user).generateAuthToken();
        const req = {
            header: jest.fn().mockReturnValue(token)
        };
        const res = {};
        const next = jest.fn();

        auth(req, res, next);
    
        expect(req.user.CF).toMatch(user.CF.code);
        expect(req.user.type).toMatch(user.type);
    });
});