const {validateReqEmail, validateReqPhone} = require('../../helper/auth_helper')

describe('validateReqEmail', () => {
    let email = ''

    it('should return an error if email is not a string', () => {
        email = 89809
        
        const {error} = validateReqEmail({
            email: email,
            password: 'gjdoso154cz00'
        })

        expect(error).toBeTruthy()
        
    })

    /*it('should return an error if email is less than 5 characters long', async () => {

        expect(error).toBeTruthy()
        
    })*/

    it('should return an error if email is more than 255 characters long', () => {
        let i
        for(i=0;i<255;i++) {
            email += 'a'
        }
        email += '@gmail.com'
        
        const {error} = validateReqEmail({
            email: email,
            password: 'gjdoso154cz00'
        })

        expect(error).toBeTruthy()
        
    })

    it("should return an error if user doesn't specify email", () => {
        
        const {error} = validateReqEmail({
            password: 'gjdoso154cz00'
        })

        expect(error).toBeTruthy()
        
    })

    it('should return an error if email is not a valid email', () => {
        email = "nonE'UnaEmail"
        
        const {error} = validateReqEmail({
            email: email,
            password: 'gjdoso154cz00'
        })

        expect(error).toBeTruthy()
        
    })

    it('should return an error if password is not a string', () => {
        password = 56437

        const {error} = validateReqEmail({
            email: 'federeristheway@gmail.com',
            password: password
        })

        expect(error).toBeTruthy()
    })

    it('should return an error if password is less than 5 characters long', () => {
        password = '123'

        const {error} = validateReqEmail({
            email: 'federeristheway@gmail.com',
            password: password
        })

        expect(error).toBeTruthy()
    })

    it('should return an error if password is less than 1024 characters long', () => {
        let i

        for(i=0;i<1025;i++) {
            password += 'a'
        }

        const {error} = validateReqEmail({
            email: 'federeristheway@gmail.com',
            password: password
        })

        expect(error).toBeTruthy()
    })

    it("should return an error if user doesn't specify password", () => {
        
        const {error} = validateReqEmail({
            email: 'federeristheway@gmail.com',
        })

        expect(error).toBeTruthy()
        
    })

    it('should return no errors if email and password are valid', () => {
        email = 'federeristheway@gmail.com'

        const {error} = validateReqEmail({
            email: email,
            password: 'gjdoso154cz00'
        })

        expect(error).toBeFalsy()
    })
})

describe('validateReqPhone', () => {
    let phone
    let password = ''

    it('should return an error if phone is not a string', () => {
        phone = 89809
        
        const {error} = validateReqPhone({
            phone: phone,
            password: 'gjdoso154cz00'
        })

        expect(error).toBeTruthy()
        
    })

    it("should return an error if phone doesn't respect the correct pattern that we know", () => {
        phone = '32456..dd'

        const {error} = validateReqPhone({
            phone: phone,
            password: 'gjdoso154cz00'
        })

        expect(error).toBeTruthy()
        
    })

    it("should return an error if user doesn't specify phone", () => {
        
        const {error} = validateReqPhone({
            password: 'gjdoso154cz00'
        })

        expect(error).toBeTruthy()
        
    })

    it('should return an error if password is not a string', () => {
        password = 56437

        const {error} = validateReqPhone({
            phone: '3453344555',
            password: password
        })

        expect(error).toBeTruthy()
    })

    it('should return an error if password is less than 5 characters long', () => {
        password = '123'

        const {error} = validateReqPhone({
            phone: '3453344555',
            password: password
        })

        expect(error).toBeTruthy()
    })

    it('should return an error if password is less than 1024 characters long', () => {
        let i

        for(i=0;i<1025;i++) {
            password += 'a'
        }

        const {error} = validateReqPhone({
            phone: '3453344555',
            password: password
        })

        expect(error).toBeTruthy()
    })

    it("should return an error if user doesn't specify password", () => {
        
        const {error} = validateReqPhone({
            phone: '3453344555'
        })

        expect(error).toBeTruthy()
        
    })

    it('should return no errors if phone and password are valid', () => {
        phone = '3325467123'

        const {error} = validateReqPhone({
            phone: phone,
            password: 'gjdoso154cz00'
        })

        expect(error).toBeFalsy()
    })
})