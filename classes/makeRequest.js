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
	this.volumePattern = /\d+\(\d+\)|\<em\>\d+\<\/em\>/;
	this.altJournalPattern = /,\s{1}\d+,|,\s{1}\d+\<\/em\>|\<em\>\d+,\<\/em\>/;
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
}

MakeCalls.prototype.isMovie = function(refArray){
	//console.log("website function",refArray);
	this.findAuthors(refArray);
}

MakeCalls.prototype.isMagazine = function(refArray){
	//console.log("website function",refArray);
	this.findAuthors(refArray);
}

MakeCalls.prototype.isNewspaper = function(refArray){
	//console.log("website function",refArray);
	this.findAuthors(refArray);
}


MakeCalls.prototype.isBook = function(refArray,refString){
	console.log("book function",refArray);
	let refObject = {};
	let emTitleRegex = /\<em\>(.+?)\<\/em\>/g;
	//match regular title no em
	let titleInTextbook = /\(\d{4}\)\.[^<]*\.\)*,*/g;
	let cityRegex = /(\(pp\.\s{1}\d+(-|\u2013|\u2014)\d+\)\.|<\/em\>\.)(.+?),/g
	let cityMatches = refString.match(cityRegex);
	let emTitleMatches = refString.match(emTitleRegex);
	let titleInTextbookMatches = refString.match(titleInTextbook);
	//handle pages
	let pageMatch = refString.match(this.bookPagePattern);
	if(cityMatches){
		refObject.city = cityMatches[0].replace(/\(pp\.\s{1}\d+(-|\u2013|\u2014)\d+\)\./,"").replace(/<\/em\>\./,"").replace(/\s+/,"").replace(/,/,"");
	}
	console.log(cityMatches);
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
	let cityFound = false;
	let cityArray = [];
	let stateFound = false;
	let stateArray = [];
	let publisherIndex = 0;
	let publisherArray = [];
	for(let i = afterYearIndex;i < refArray.length;i++){
		
		//find state/province

		 if(refArray[i].endsWith(":") && !stateFound){
			stateArray.push(refArray[i]);
			stateFound = true;
		}
		else if(refArray[i].endsWith(",") && !cityFound){
			cityArray.push(refArray[i]);
			cityFound = true;
		}
		

		//handle 2 word states
		else if(!stateFound && refArray[i].endsWith(":")){
			stateArray.push(refArray[i]);
			stateFound = true;
			cityFound = true;
		}
		else if(!stateFound && refArray[i + 1].endsWith(":")){
			stateArray.push(refArray[i]);
			cityFound = true;
			publisherIndex = i;

		}
		//handle 2 word cities
		else if(!cityFound && refArray[i].endsWith(",")){
			cityArray.push(refArray[i]);
			cityFound = true;
		}
		else if(!cityFound && refArray[i + 1] && refArray[i + 1].endsWith(",")){
			cityArray.push(refArray[i]);
		}
		//capture publisher
		else if(i >= publisherIndex){
			publisherArray.push(refArray[i]);
		}	
	}

	refObject.pages = pageMatch ? pageMatch[0] : null;
	refObject.state = stateArray.join(" ");
	refObject.publisher = publisherArray.join(" ");

	console.log(refObject);

}

MakeCalls.prototype.isJournal = function(refArray,refString){
	//console.log("journal function",refArray);
	let refObject = {};

	let results = this.findAuthors(refArray);
	let afterYearIndex = results[1] + 1;
	refObject.authors = results[0];
	refObject.year = refArray[afterYearIndex -1];
	let titleFound = false
	let titleArray = [];
	let journalTitleFound = false;
	let journaltitleArray = [];
	let volumeNum = "";
	let issueNum = "";
	for(let i = afterYearIndex;i < refArray.length;i++){
		//capture article title
		if(!titleFound){
			titleArray.push(refArray[i]);
		}
		//capture journal title
		else if(titleFound && !journalTitleFound){
			journaltitleArray.push(refArray[i])
		}
		//capture journal volume and issue
		else if(titleFound && journalTitleFound && refArray[i].startsWith('<em>')){
			let volumeString = refArray[i].replace("<em>","").replace("</em>"," ");
			let volumeArr = volumeString.split(" ");
			volumeNum = "<em>" + volumeArr[0] + "</em>";
			issueNum = volumeArr[1];
		}

		if(refArray[i].endsWith(".") && !titleFound){
			titleFound = true;
		}
		if(refArray[i].endsWith("</em>") && !journalTitleFound){
			journalTitleFound = true;
		}	
	}

	let titleString = titleArray.join(" ");
	refObject.title = titleString;
	let journalTitleString = journaltitleArray.join(" ");
	refObject.journal = journalTitleString;
	refObject.volume = volumeNum;
	refObject.issue = issueNum;
	refObject.pages = refArray[refArray.length -1];
	//console.log("site ref object ",refObject);
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
	//console.log("mla test",this.altJournalPattern.test(refString));
	if(this.altJournalPattern.test(refString)){
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
	if(this.refTypefunctions[refType]){
		this.refTypefunctions[refType](refArray,referenceText);
	}
	/*
	if(refType === "Unknown"){
		console.log(refArray[0],refType);
	}
	*/
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
	//console.log(fullRefText.replace(/Google Scholar|CrossRef/g,"").replace(/ +/g,' ').replace(/\n/g,"").trim());
	return fullRefText.replace(/Google Scholar|CrossRef/g,"").replace(/ +/g,' ').replace(/\n/g,"").trim();
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