const chai = require('chai');
const expect = chai.expect;

describe("Tests for reference functions",function(){
	it("should return correct reference type",function(done){

		expect(1+1).to.equal(3);
		done();
	});
});