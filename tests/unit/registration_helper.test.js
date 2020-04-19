const {calculateCF}=require('../../helper/registration_helper')

describe('Calculate CF', () => {
    it("should return right CF if all data are setted", () => {

        const cf=calculateCF('Daniele','Bufalieri','M','02','12','1998','Roma')
        expect(cf.code).toBe('BFLDNL98T02H501H')
    })


})
