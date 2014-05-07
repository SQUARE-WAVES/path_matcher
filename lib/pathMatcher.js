function head(arr) {
	return arr[0];
}

function rest(arr) {
	return arr.slice(1,arr.length);
}

function first(arr){
	return arr.slice(0,arr.length-1);
}

function last(arr){
	return arr.slice(arr.length-1,arr.length)[0];
}

//-------------------------------------------------------------------------------------------------
//  this function works by pairing off the starting elements of the path and thing you are matching
//	against and then recursively matching the remaining routes, it stores the matched pairs,
//	and in the case of a mismatch backs off of optional matches and tries again, rather
//	than directly matching strings or regexes it uses an interface that lets parts define their
//	own matching function, that allows for easy testing and extention
//-------------------------------------------------------------------------------------------------

//TODO update this guy to a "Parallel Nondeterministic Finite Automaton model (it's faster and could be fun)"
//http://swtch.com/~rsc/regexp/regexp1.html

function matchPath(path,test,matches) {
	//helpers!
	var backTrackToLastOptionalParam = function(matches,backPath,backTest){

		if(matches.length === 0){
			return false;
		}

		var lastMatch = last(matches);

		if(lastMatch.pathParam.isOptional){
			return {
				'matches':first(matches),
				'backPath':backPath,
				'backTest':[lastMatch.matched].concat(backTest)
			};
		}
		else {
			return backTrackToLastOptionalParam(first(matches),[lastMatch.pathParam].concat(backPath),[lastMatch.matched].concat(backTest));
		}
	}

	var handleSplat = function(pathHead,testHead,path,matches){
		if(test.length === 0){
			if(pathHead.isOptional){
				return matches;
			}
			else {
				return false;	
			}
		}

		var finalMatches = matches.concat({'pathParam':pathHead,'matched':test});
		return finalMatches;
	}

	if(path.length === 0 && test.length === 0){
		return matches;
	}
	else if(path.length === 0 && test.length !==0){
		return false;
	}

	var pathHead = head(path);

	if(pathHead.isSplat){
		return handleSplat(pathHead,testHead,path,matches)
	}

	var testHead = head(test);

	if(pathHead.matches(testHead)){
		return matchPath(rest(path),rest(test),matches.concat({'pathParam':pathHead,'matched':testHead}));
	}
	else{
		if(pathHead.isOptional){
			return matchPath(rest(path),test,matches);
		}
		else {
			//we have to backtrack to the last optional param
			var backtrackResults = backTrackToLastOptionalParam(matches,[],[]);
			if(backtrackResults === false){
				return false
			}
			else {
				return matchPath(backtrackResults.backPath.concat(path),backtrackResults.backTest.concat(test),backtrackResults.matches);	
			}
		}
	}
}

//this wrapper takes care of the array you would otherwise be passing in
module.exports = function(path,test){
	return matchPath(path,test,[]);
}