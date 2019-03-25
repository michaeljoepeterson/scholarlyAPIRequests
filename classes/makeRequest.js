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
	this.refTypefunctions = {
		isWebsite: this.isWebsite
	};
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
MakeCalls.prototype.isWebsite = function(data,test){
	console.log("website function",data,test);
}
//use this to determine the type of reference will check for journal, magazine, book, newspaper, webiste, movie and encyclopedia
MakeCalls.prototype.checkRefType = function(data){

}


//use this to organize the references
MakeCalls.prototype.splitReference = function(referenceText){
	//const $ = cheerio.load(reference);
	let refArray = referenceText.replace(/Google Scholar|CrossRef/g,"").replace(/ +/g,' ').replace(/\n/g,"").trim().split(" ");
	let refType = "isWebsite";
	this.refTypefunctions[refType]("yup","sure");
	for(let i = 0;i < refArray.length;i++){
		//console.log(refArray[i]);
		if(refArray[i] === ""){
			c//onsole.log(i,refArray[i],refArray);
		}
		
	}
	//console.log("ref array ",refArray, refArray.length);
}

//place em tags in correct place
//may need a check fo em tags before title ie date specifically
MakeCalls.prototype.placeItalics = function(reference){
	const $ = cheerio.load(reference);
	let fullRefText = $(reference).text();
	const emChildren = $(reference).children(".EmphasisTypeItalic ");
	const emText = emChildren.text();

	for(let i = 0;i < emChildren.length;i++){

		let emIndex = fullRefText.search($(emChildren[i]).text())
		if(emIndex !== -1){
			let emLength = $(emChildren[i]).text().length
			//console.log("em index",emIndex);
			let beforeEm = fullRefText.slice(0,emIndex);
			let afterEm = fullRefText.slice(emIndex + emLength,fullRefText.length)
			//console.log("before em", beforeEm);
			//console.log("after em", afterEm);
			fullRefText = beforeEm + "<em>" + $(emChildren[i]).text() + "</em>" + afterEm;
		}
	}
	//console.log(fullRefText);
	return fullRefText;
}


MakeCalls.prototype.articleRequestMade = function(error,response,body) {
	try{
		if(body !== undefined){
			let self = this;
			//console.log("html",body);
			const $ = cheerio.load(body);
			const citationContent = $(".CitationContent");
			console.log("citations ===============================",citationContent.length);
			
			for(let i = 0;i < citationContent.length;i++){
				//console.log($(citationContent[i]).text());
				let emText = this.placeItalics($(citationContent[i]));
				this.splitReference(emText);
				this.referenceData.results.push({
					id:this.idCounter,
					rawText:emText
				});
				this.idCounter++
			}
			
			//console.log(this.referenceData);
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