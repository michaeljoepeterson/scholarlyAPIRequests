const chai = require('chai');
const expect = chai.expect;
const {MakeCalls} = require('../classes/makeRequest');
const {testData} = require('./testData');

describe("Tests for reference functions",function(){
	let makeCalls = new MakeCalls()

	it("should return correct reference type for journals",function(done){
		
		for(let i = 0;i < testData.journals.length;i++){
			
			let refArray = testData.journals[i].replace(/Google Scholar|CrossRef/g,"").replace(/ +/g,' ').replace(/\n/g,"").trim().split(" ");
			let currentRefType = makeCalls.checkRefType(testData.journals[i],refArray)
			//console.log("journal ref type: ", currentRefType);
			expect(currentRefType).to.equal("isJournal");
		}
		
		done();
	});

	it("should return correct reference type for books",function(done){
		
		for(let i = 0;i < testData.book.length;i++){
			
			let refArray = testData.book[i].replace(/Google Scholar|CrossRef/g,"").replace(/ +/g,' ').replace(/\n/g,"").trim().split(" ");
			let currentRefType = makeCalls.checkRefType(testData.book[i],refArray)
			//console.log("journal ref type: ", currentRefType);
			expect(currentRefType).to.equal("isBook");
		}
		//expect(1+1).to.equal(3);
		
		done();
	});

	it("should return correct reference type for journal no issues",function(done){
		
		for(let i = 0;i < testData.journalsNoIssue.length;i++){
			
			let refArray = testData.journalsNoIssue[i].replace(/Google Scholar|CrossRef/g,"").replace(/ +/g,' ').replace(/\n/g,"").trim().split(" ");
			let currentRefType = makeCalls.checkRefType(testData.journalsNoIssue[i],refArray)
			//console.log("journal ref type: ", currentRefType);
			expect(currentRefType).to.equal("isJournalNoIssue");
		}
		//expect(1+1).to.equal(3);
		
		done();
	});
});