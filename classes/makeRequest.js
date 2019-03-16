//calls class
function MakeCalls(request,apiKey,url){
	this.request = request;
	this.apiKey = apiKey;
	this.url = url;
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

MakeCalls.prototype.requestMade = function(error,response,body) {
	const parsedBody = JSON.parse(body);
	console.log("request data",parsedBody);
}
//make the actual request
MakeCalls.prototype.makeRequest = function(){
	const options = {
		url:this.url,
		qs:{
			api_key:this.apiKey,
			q:"subject:Psychology",
			output:"json",
			p:"100"
		}
	};

	this.request(options,this.requestMade);
}


module.exports = {MakeCalls};