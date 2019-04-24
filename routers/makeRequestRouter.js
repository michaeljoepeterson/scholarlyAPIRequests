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
    	for(let i = 0;i < parsedData.records.length;i++){

			console.log("url: ",parsedData.records[i].url[0].value);
		}
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