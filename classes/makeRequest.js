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
		isWebsite: this.isWebsite.bind(this),
		isEncyclopedia: this.isEncyclopedia.bind(this),
		isMovie: this.isMovie.bind(this),
		isMagazine: this.isMagazine.bind(this),
		isNewspaper:this.isNewspaper.bind(this),
		isBook:this.isBook.bind(this),
		isJournal:this.isJournal.bind(this)
	};
	this.yearPattern = /\(\d{4}\)/;
	this.yearMonthPattern = /\(\d{4},\s\w+\s{0,1}\d{0,2}\)/;
	this.emPattern = /\<em\>/;
	//,\s{1}\d+, this can be used to find a mla journal reference and then filter that out
	this.volumePattern = /\d+\(\d+\)/;
	this.mlaJournalPattern = /,\s{1}\d+,|,\s{1}\d+\<\/em\>/;
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
//can use this in all checks
MakeCalls.prototype.findAuthors = function(refArray){
	let foundYear = false
	let authorArray = [];
	for(let i = 0;i < refArray.length;i++){
		if(this.yearPattern.test(refArray[i]) || this.yearMonthPattern.test(refArray[i])){
			break;
		}
		else{
			authorArray.push(refArray[i]);
		}
	}

	let authorString = authorArray.join(" ");
	console.log("author string: ",authorString);
}
MakeCalls.prototype.isWebsite = function(refArray){
	console.log("website function");
	let refObject = {};
	this.findAuthors(refArray);
	//for(let i = 0;i < )
}

MakeCalls.prototype.isEncyclopedia = function(refArray){
	//console.log("website function",data);
	this.findAuthors(refArray);
}

MakeCalls.prototype.isMovie = function(refArray){
	//console.log("website function",data);
	this.findAuthors(refArray);
}

MakeCalls.prototype.isMagazine = function(refArray){
	//console.log("website function",data);
	this.findAuthors(refArray);
}

MakeCalls.prototype.isNewspaper = function(refArray){
	//console.log("website function",data);
	this.findAuthors(refArray);
}

MakeCalls.prototype.isBook = function(refArray){
	//console.log("website function",data);
	this.findAuthors(refArray);
}

MakeCalls.prototype.isJournal = function(refArray){
	//console.log("website function",data);
	this.findAuthors(refArray);
}
//use this to determine the type of reference will check for journal, magazine, book, newspaper, webiste, movie and encyclopedia
MakeCalls.prototype.checkRefType = function(refString,refArray){
	let refType = "Unknown";
	//Check if encyclopedia
	if(refString.search("Encylopedia") !== -1 || refString.search("encylopedia") !== -1){
		refType = "isEncyclopedia";
		return refType;
	}
	//check if movie
	else if(refString.search("Producer") !== -1 || refString.search("Director") !== -1){
		refType = "isMovie";
		return refType;
	}
	//check if website
	else if(refString.search("Retrieved from URL") !== -1 || refString.search("Retrieved from") !== -1){
		refType = "isWebsite";
		return refType;
	}

	if(this.yearMonthPattern.test(refString)){
		if(this.volumePattern.test(refString)){
			refType = "isMagazine";
			return refType;
		}
		else{
			refType = "isNewspaper";
			return refType;
		}
	}
	//console.log("mla test",this.mlaJournalPattern.test(refString));
	if(this.mlaJournalPattern.test(refString)){
		refType = "mla";

		return refType;
	}

	for(let i = 0;i < refArray.length;i++){
		if(this.yearPattern.test(refArray[i])){
			if(this.emPattern.test(refArray[i + 1])){
				refType = "isBook";
				break;
			}
			else{
				refType = "isJournal";
				break;
			}
		}

	}

	return refType;
}


//use this to organize the references return object with split ref sections
MakeCalls.prototype.splitReference = function(referenceText){
	//const $ = cheerio.load(reference);
	let refArray = referenceText.replace(/Google Scholar|CrossRef/g,"").replace(/ +/g,' ').replace(/\n/g,"").trim().split(" ");
	//let refType = "isWebsite";
	//this.refTypefunctions[refType]("yup","sure");
	let refType = this.checkRefType(referenceText,refArray);
	if(this.refTypefunctions[refType]){
		this.refTypefunctions[refType](refArray);
	}
	//console.log(refArray[0],refType);

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
			let beforeEm = fullRefText.slice(0,emIndex);
			let afterEm = fullRefText.slice(emIndex + emLength,fullRefText.length)
			fullRefText = beforeEm + "<em>" + $(emChildren[i]).text() + "</em>" + afterEm;
		}
	}

	return fullRefText;
}


MakeCalls.prototype.articleRequestMade = function(error,response,body) {
	try{
		if(body !== undefined){
			let self = this;
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