const express = require("express");
const {PORT,API_KEY,URL} = require('../config');
const router = express.Router();
const {MakeCalls} = require('../classes/makeRequest');

router.get("/",(req,res)=>{
	//how many articles to get
	let pVal = req.query.pVal;
	if(!pVal){
		return res.json({
			status:500,
			message:"missing pVal"
		});
	}
	const makeCalls = new MakeCalls(API_KEY,URL);
    return makeCalls.makeRequest(pVal)

    .then(parsedData => {
    	let articleUrls = [];

    	for(let i = 0;i < parsedData.records.length;i++){
    		articleUrls.push(parsedData.records[i].url[0].value);
			//console.log("url: ",parsedData.records[i].url[0].value);
		}
		let citations = [];

		//get undefined first cus of first promise
		//then get first set of citations then second in the next then
		return articleUrls.reduce(function(previous,item){
			return previous.then(citationData => {
				//console.log(citationData); 
				return makeCalls.getReferences(item).then(Array.prototype.concat.bind(citationData))
				//.then(data => [...data])
			})
		}, Promise.resolve([]))
		
    })

    .then((citations) => {
    	console.log("citations===============",citations.length);
    	makeCalls.articleRequestMade(citations)
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