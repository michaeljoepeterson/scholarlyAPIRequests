const cheerio = require('cheerio');
const request = require('request');

//calls class
function MakeCalls(apiKey,url){
	this.request = request;
	this.apiKey = apiKey;
	this.url = url;
	this.referenceData = {
		results:[]
	};
	this.idCounter = 0;
}
//initialize file writing class for json
MakeCalls.prototype.createFile = function(data) {
	
}
//call this on request error
MakeCalls.prototype.requestError = function(data) {
	
}
//call this on successful request
MakeCalls.prototype.requestSuccess = function(data) {
	
}

MakeCalls.prototype.findAuthors = function(data){

}

MakeCalls.prototype.placeItalics = function(data){

}

MakeCalls.prototype.articleRequestMade = function(error,response,body) {
	try{
		if(body !== undefined){
			let self = this;
			//console.log("html",body);
			const $ = cheerio.load(body);
			const citationContent = $(".CitationContent");
			console.log(citationContent.length);
			
			for(let i = 0;i < citationContent.length;i++){
				//console.log($(citationContent[i]).text());
				this.referenceData.results.push({
					id:this.idCounter,
					rawText:$(citationContent[i]).text()
				});
				this.idCounter++
			}
			
			console.log(this.referenceData);
		}
	}
	catch(error){
		console.log("error article", error);
	}
}

MakeCalls.prototype.getReferences = function(articleUrl) {
	const options = {
		url:articleUrl
	};

	this.request(options,this.articleRequestMade.bind(this));
}

MakeCalls.prototype.requestMade = function(error,response,body) {
	try{
		//console.log("body===========",response)
		if(body !== undefined){
			const parsedBody = JSON.parse(body);
			;
			//console.log("apikey===========",this.apiKey)
			for(let i = 0;i < parsedBody.records.length;i++){
				console.log("urls",parsedBody.records[i].url[0].value, i)
				this.getReferences(parsedBody.records[i].url[0].value);
			}
		}
		
	}
	catch(error){
		console.log("error ", error);
	}
	
}
//make the actual request
//to continue at next set of results it is p + 1
MakeCalls.prototype.makeRequest = function(){
	const options = {
		url:this.url,
		qs:{
			api_key:this.apiKey,
			q:"subject:Psychology openaccess:true",
			output:"json",
			p:"2"

		}
	};

	this.request(options,this.requestMade.bind(this));
}


module.exports = {MakeCalls};