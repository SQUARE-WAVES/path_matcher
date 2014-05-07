var pathMatcher = require('./lib/pathMatcher.js');
var helpers = require('PDL');

//-----------------------------------------------------------------------------
// A route schema is a description for a route, it should be serializable as json
// it needs to be able to be "compiled" into a thing which test to see that a 
// route's path matches it. Or a thing that generates a correct path given 
// some values for parameterized path.

// they will look something like this

// name : {
// 	'path':'/blah/:bloo/:blarp?'
// 	'pathParams':{
// 		'bloo':{
// 			'regex':('.*');
// 		},
// 		'blarp':{
// 			'values':[
// 				'true',
// 				'false',
// 				'not sure'
// 			]
// 		}
// 	}
// }
//-----------------------------------------------------------------------------

var compilePathMatcher = function(schema){

	var pathData = helpers.createPathData(schema);
	
	return function(test){
		var testPath = helpers.tokenizePath(test);
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