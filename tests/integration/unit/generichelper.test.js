const {validateDate} = require('../../../helper/generic_helper')

describe('validateDate ', () => {
    it('should return true if it is a valid date', () => {

        const date=new Date();
        const res=validateDate(date)
      expect(res).toBe(true)
    });


    it('should return false if it is an invalid date', () => {

        const date='notvalid'
        const res=validateDate(date)
        expect(res).toBe(false)
    });
  });