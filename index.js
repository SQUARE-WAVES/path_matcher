var pathMatcher = require('./lib/pathMatcher.js');
var pdl = require('path_description_language');

var compilePathMatcher = function(schema){

	var pathData = pdl.compilePath(schema.pathDescription);
	
	return function(test){
		var testPath = pdl.tokenizePath(test);
		var matchSet = pathMatcher(pathData,testPath);

		if(!matchSet){
			return false;
		}
		else{
			var pvals = {};
			matchSet.forEach(function(item){
				if(item.pathParam.name){
					pvals[item.pathParam.name] = item.matched;
				}
			});

			return pvals;
		}
	}
}

module.exports = compilePathMatcher;