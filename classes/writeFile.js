const fs = require('fs');
function WriteFile(){
	this.fs = fs
	//this.refData = refData
}

WriteFile.prototype.checkID = function(){
	let promise = new Promise((resolve,reject) => {
		this.fs.readFile('./data/APAdata.json','utf-8',function(err,data){
			try{
				if(err){
					reject(err);
				}
				else{

					let oldData = JSON.parse(data);
					//console.log("olddata",oldData)
					//let startID = 0;
					if(oldData.results){
						resolve(oldData.results.length);
					}
					else{
						resolve(0);
					}
				}
			}
			
			catch(error){
				//console.log(error);
				
				if(error instanceof SyntaxError){
					resolve(0)
				}

				reject(error);
			}
			
		})

	});

	return promise
} 

WriteFile.prototype.writeData = function(refData){
	let promise = new Promise((resolve,reject) => {
		this.fs.readFile('./data/APAdata.json','utf-8',function(err,data){
			if(err){
				reject(err);
			}
			else{
				let oldData;
				try{
					oldData = JSON.parse(data);
				}
				catch(error){
					
				}
				
				let newData;
				//let startID = 0;
				if(oldData !== undefined){
					if(oldData.results){
						//oldData.results.push(refData)
						for(let i = 0;i < refData.results.length;i++){
							oldData.results.push(refData.results[i]);
						}
					}
					
				}
				//case for empty file
				else{
					oldData = refData;
				}

				
				newData = JSON.stringify(oldData)	
			
				this.fs.writeFile('./data/APAdata.json',newData,'utf-8',function(err,data){
					if(err){
						reject(err);
					}
					else{
						resolve();
					}
				})
				
			}
		}.bind(this))

	});

	return promise
}

module.exports = {WriteFile};