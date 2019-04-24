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
	//this could probably be avoided with promises if set up properly
	this.urls = [];
	this.urlIndex = 0;
	this.idCounter = 0;
	this.refTypefunctions = {
		isWebsite: this.isWebsite.bind(this),
		isEncyclopedia: this.isEncyclopedia.bind(this),
		isMovie: this.isMovie.bind(this),
		isMagazine: this.isMagazine.bind(this),
		isNewspaper:this.isNewspaper.bind(this),
		isBook:this.isBook.bind(this),
		isJournal:this.isJournal.bind(this),
		isJournalNoIssue:this.isJournalNoIssue.bind(this)
	};
	this.yearPattern = /\(\d{4}\w*\)/;
	this.yearMonthPattern = /\(\d{4},\s\w+\s{0,1}\d{0,2}\)/;
	this.emPattern = /\<em\>/;
	//up to 3 word publisher
	//this.bookPattern = /\w+,\s{1}\w+\:\s{1}\w+\s*\w*\s*\w*\./;
	this.bookPattern = /\w+\:\s{1}/;
	//this.textbookPattern = /\(\d{4}\)\.(.+?)/;
	//this pattern is now matching everything
	//likely will need to split up pattern to get correct classification split up at (pp) and use standard book pattern
	this.bookPagePattern =/\(pp\.\s{1}\d+(-|\u2013|\u2014)\d+\)\./;
	this.altBookPattern = /\(pp\.\s{1}\d+\-|\u2013|\u2014\d+\)\.\s{1}\w+,\s{1}\w+\:\s{1}\w+\s*\w*\s*\w*\./;
	this.bookPatternNoCity = /\(pp\.\s{1}\d+\-|\u2013|\u2014\d+\)\.\s{1}\w+\:\s{1}\w+\s*\w*\s*\w*\./
	//,\s{1}\d+, this can be used to find a mla journal reference and then filter that out
	this.volumePattern = /\(\d+\),|\<em\>\d+\<\/em\>/;
	this.altJournalPattern = /,\s{1}\d+,|,\s{1}\d+\<\/em\>|\<em\>\d+,\<\/em\>|\<em\>\d+\<\/em\>/;
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
	let yearIndex = 0;
	for(let i = 0;i < refArray.length;i++){
		if(this.yearPattern.test(refArray[i]) || this.yearMonthPattern.test(refArray[i])){
			yearIndex = i;
			break;
		}
		else{
			authorArray.push(refArray[i]);
		}
	}

	let authorString = authorArray.join(" ");
	//console.log("author string: ",authorString);
	return [authorString,yearIndex];
}
MakeCalls.prototype.isWebsite = function(refArray){
	//console.log("website function",refArray);
	let refObject = {};
	let results = this.findAuthors(refArray);
	let afterYearIndex = results[1] + 1;
	refObject.authors = results[0];
	let titleFound = false
	let titleArray = [];
	refObject.year = refArray[afterYearIndex -1];
	refObject.siteUrl = refArray[refArray.length -1];
	for(let i = afterYearIndex;i < refArray.length;i++){
		if(!titleFound){
			titleArray.push(refArray[i]);
		}

		if(refArray[i].endsWith(".")){
			titleFound = true;
		}	
	}
	let titleString = titleArray.join(" ");
	refObject.title = titleString;
	//console.log("site ref object ",refObject);
	return refObject;
}

MakeCalls.prototype.isEncyclopedia = function(refArray){
	//console.log("website function",refArray);
	this.findAuthors(refArray);
	return {}
}

MakeCalls.prototype.isMovie = function(refArray){
	//console.log("website function",refArray);
	this.findAuthors(refArray);
	return {}
}

MakeCalls.prototype.isMagazine = function(refArray){
	//console.log("website function",refArray);
	this.findAuthors(refArray);
	return {}
}

MakeCalls.prototype.isNewspaper = function(refArray){
	//console.log("website function",refArray);
	this.findAuthors(refArray);
	return {}
}


MakeCalls.prototype.isBook = function(refArray,refString){
	//console.log("book function",refArray);
	let refObject = {};
	let emTitleRegex = /\<em\>(.+?)\<\/em\>/g;
	//match regular title no em
	let titleInTextbook = /\(\d{4}\)\.[^<]*\.\)*,*/g;
	let cityRegex = /(?<=\(pp\.\s{1}\d+(-|\u2013|\u2014)\d+\)\.|<\/em\>\.)(.+?),/g;
	let stateRegex = /(?<=\<\/em\>\.|ed\.\)\.|(-|\u2013|\u2014)\d+\)\.)(.+?)\:/g;
	let publisherRegex =/(?<=\w+:)(.+?)\./g;
	let publisherMatches = refString.match(publisherRegex);
	let stateMatches = refString.match(stateRegex);
	let cityMatches = refString.match(cityRegex);
	let emTitleMatches = refString.match(emTitleRegex);
	let titleInTextbookMatches = refString.match(titleInTextbook);
	//handle pages
	let pageMatch = refString.match(this.bookPagePattern);
	if(cityMatches){
		refObject.city = cityMatches[0].trim();
	}
	else{
		refObject.city = null;
	}
	if(stateMatches){
		refObject.state = stateMatches[0].replace(refObject.city,"").replace(",","").trim();
	}
	else{
		refObject.state = null;
	}
	if(publisherMatches){
		refObject.publisher = publisherMatches[publisherMatches.length - 1];
	}
	else{
		refObject.publisher = null;
	}
	//console.log("publisher matches======",publisherMatches);
	//if it is textbook
	if(emTitleMatches && titleInTextbookMatches){
		refObject.title = titleInTextbookMatches[0].replace(/\(\d{4}\)\.\s{1}/,"");
		refObject.textBook = emTitleMatches[0];
	}
	else{
		refObject.title = emTitleMatches[0];
		refObject.textBook = null;
	}
	//handle author and year
	let results = this.findAuthors(refArray);
	let afterYearIndex = results[1] + 1;
	refObject.authors = results[0];
	refObject.year = refArray[afterYearIndex -1];

	refObject.pages = pageMatch ? pageMatch[0] : null;
	//console.log(refObject);
	return refObject;
}
//will have to modify this depending on how they place italics
MakeCalls.prototype.isJournalNoIssue = function(refArray,refString){

	let refObject = {};

	let results = this.findAuthors(refArray);
	let afterYearIndex = results[1] + 1;
	refObject.authors = results[0];
	refObject.year = refArray[afterYearIndex -1];

	let titleRegex = /(?<=\(\d{4}\w*\)\.\s+)(.*?)(\.|\?)(?=\s{1}\<)/g;
	let titleMatches = refString.match(titleRegex);
	let journalTitleRegex = /(?<=\<em\>)(.*?)(?=,)/g;
	let journaltitleMatches = refString.match(journalTitleRegex);
	refObject.title = titleMatches[0];
	refObject.journal = journaltitleMatches[0]; 
	let volumeRegex = /(\d*?)(?=\<\/em\>)/g;
	let volumeMatch = refString.match(volumeRegex);
	refObject.volume = volumeMatch[0];
	let pagesRegex = /(?<=\<\/em\>)(.*?)\./g;
	let pageMatch = refString.match(pagesRegex);
	
	refObject.pages = pageMatch[0];
	//console.log(refObject);
	return refObject;
}
//will have to modify for volume/issue
MakeCalls.prototype.isJournal = function(refArray,refString){
	let refObject = {};

	let results = this.findAuthors(refArray);
	let afterYearIndex = results[1] + 1;
	refObject.authors = results[0];
	refObject.year = refArray[afterYearIndex -1];
	let titleRegex = /(?<=\(\d{4}\w*\)\.\s+)(.*?)(\.|\?)(?=\s{1}\<)/g;
	let titleMatches = refString.match(titleRegex);
	refObject.title = titleMatches[0];
	let journalTitleRegex = /(?<=\<em\>)(.*?)(?=,)/g;
	let journaltitleMatches = refString.match(journalTitleRegex);
	refObject.journal = journaltitleMatches[0];
	let volumeRegex = /(?<=\,\s{1})(\d*?)(?=\<\/em\>)/g;
	let volumeMatch = refString.match(volumeRegex);
	refObject.volume = volumeMatch[0];
	let issueRegex = /(?<=\<\/em\>\()(\d*?)(?=\)\,)/g;
	let issueMatch = refString.match(issueRegex);
	refObject.issue = issueMatch[0];
	let pagesRegex = /(?<=\)\,)(.*?)\./g;
	let pageMatch = refString.match(pagesRegex);
	refObject.pages = pageMatch[0];

	console.log("joural ref object ",refObject);
	return refObject;
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

	if(this.altJournalPattern.test(refString) && !this.volumePattern.test(refString)){
		refType = "isJournalNoIssue";

		return refType;
	}
	if(this.bookPagePattern.test(refString)){
		refType = "isBook";

		return refType;
	}
	for(let i = 0;i < refArray.length;i++){
		if(this.yearPattern.test(refArray[i])){
			if(this.emPattern.test(refArray[i + 1]) && (this.bookPattern.test(refString))){
				refType = "isBook";
				break;
			}
			else if(this.volumePattern.test(refString)){
				refType = "isJournal";
				break;
			}
		}

	}

	return refType;
}


//use this to organize the references return object with split ref sections
MakeCalls.prototype.splitReference = function(referenceText){
	let refArray = referenceText.replace(/Google Scholar|CrossRef/g,"").replace(/ +/g,' ').replace(/\n/g,"").trim().split(" ");

	let refType = this.checkRefType(referenceText,refArray);
	let referenceObject;
	if(this.refTypefunctions[refType]){
		referenceObject = this.refTypefunctions[refType](refArray,referenceText);
		referenceObject.type = refType;
	}
	/*
	if(refType === "Unknown"){
		console.log(refArray[0],refType);
	}
	*/
	return referenceObject;
}

//place em tags in correct place
//may need a check fo em tags before title ie date specifically
MakeCalls.prototype.placeItalics = function(reference){
	const $ = cheerio.load(reference);
	let fullRefText = $(reference).text();
	const emChildren = $(reference).children(".EmphasisTypeItalic");
	const emText = emChildren.text();
	//console.log(emText);
	for(let i = 0;i < emChildren.length;i++){
		let startYearIndex = fullRefText.search(this.yearPattern);
		let yearEndIndex = startYearIndex + 6;

		let emIndex = fullRefText.search($(emChildren[i]).text());
		if(emIndex !== -1){
			let emLength = $(emChildren[i]).text().length
			let beforeEm = fullRefText.slice(0,emIndex);
			let afterEm = fullRefText.slice(emIndex + emLength,fullRefText.length)
			fullRefText = beforeEm + "<em>" + $(emChildren[i]).text() + "</em>" + afterEm;
		}
	}

	return fullRefText.replace(/Google Scholar|CrossRef/g,"").replace(/ +/g,' ').replace(/\n/g,"").trim();
}


MakeCalls.prototype.articleRequestMade = function(error,response,body) {
	try{
		if(body !== undefined){
			//let self = this;
			const $ = cheerio.load(body);
			const citationContent = $(".CitationContent");
			console.log("citations ===============================",citationContent.length);
			
			for(let i = 0;i < citationContent.length;i++){

				try{
					let emText = this.placeItalics($(citationContent[i]));
					//console.log(emText);
					let refInfo = this.splitReference(emText);
					this.referenceData.results.push({
						id:this.idCounter,
						rawText:emText,
						referenceInfo: refInfo,
						
					});
					this.idCounter++;
				}
				catch(err){
					console.log("errror in articleRequestMade",err);
				}
				
			}
			//this.urlIndex++;
			//this should be the finished data
			
			for(let i = 0; i < this.referenceData.results.length;i++){
				//console.log(this.referenceData.results[i].rawText);
			}
		}
	}
	catch(error){
		console.log("error article", error);
	}
}
//need this to return a promise and have article request function a anonymous function so that writing to the file can occur at the end of structuring all the data
//unless only run one article at a time
MakeCalls.prototype.getReferences = function(articleUrl) {
	let promise = new Promise((resolve,reject) => {
		const options = {
			url:articleUrl
		};

		this.request(options,function(errror,response,body){
			const $ = cheerio.load(body);
			const citationContent = $(".CitationContent");
			resolve(citationContent);
		});

	});

	return promise
	
}
/*
MakeCalls.prototype.requestMade = function(error,response,body) {
	try{

		if(body !== undefined){
			const parsedBody = JSON.parse(body);
			

			for(let i = 0;i < parsedBody.records.length;i++){

				this.getReferences(parsedBody.records[i].url[0].value);
			}
		}
		
	}
	catch(error){
		console.log("error ", error);
	}
	
}
*/
//make the actual request
//to continue at next set of results it is p + 1
//may also want to figure out how to return a promise from this
//===========================================
//will likely need to make this not a class 
//will also need to make a router eventually that I can use to make request and pass the p value
//===========================================
MakeCalls.prototype.makeRequest = function(pVal){
	let promise = new Promise((resolve,reject) => {
		const options = {
		url:this.url,
		qs:{
			api_key:this.apiKey,
			q:"subject:Psychology openaccess:true",
			output:"json",
			p:pVal

			}
		};

		this.request(options,function(errror,response,body){
			const parsedBody = JSON.parse(body);
			resolve(parsedBody);
		});
	});
	

	return promise;
}


module.exports = {MakeCalls};