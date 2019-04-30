const express = require("express");
const {PORT,API_KEY,URL} = require('../config');
const router = express.Router();
const {MakeCalls} = require('../classes/makeRequest');
const {WriteFile} = require('../classes/writeFile');

router.get("/",(req,res)=>{
	//how many articles to get
	let pVal = req.query.pVal;
	let sVal = req.query.sVal;
	let makeCalls;
	if(!pVal){
		return res.json({
			status:500,
			message:"missing pVal"
		});
	}
	const writeFile = new WriteFile();
	return writeFile.checkID()

	.then(refID => {
		makeCalls = new MakeCalls(API_KEY,URL,refID);
    	return makeCalls.makeRequest(pVal,sVal)
	})
	
    .then(parsedData => {
    	let articleUrls = [];

    	for(let i = 0;i < parsedData.records.length;i++){
    		articleUrls.push(parsedData.records[i].url[0].value);
			//console.log("url: ",parsedData.records[i].url[0].value);
		}
		let citations = [];

		//get undefined first cus of first promise
		//then get first set of citations then second in the next then
		//this will return all article data in one array
		return articleUrls.reduce(function(previous,item){
			return previous.then(citationData => {
				//console.log(citationData); 
				return makeCalls.getReferences(item).then(Array.prototype.concat.bind(citationData))
				//.then(data => [...data])
			})
		}, Promise.resolve([]))
		
    })

    .then((citations) => {
    	//console.log("citations===============",citations.length);
    	let referenceData = makeCalls.articleRequestMade(citations)
    	writeFile.writeData(referenceData);
    	//console.log(referenceData.results.length);
    	
    })

    .then(() => {
    	return res.json({
			status:400,
			message:"All done"
		});
    })

    .catch(err => {
    	console.log("error in get request",err);
    });
});

module.exports = {router}