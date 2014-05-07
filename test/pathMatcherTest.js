var assert = require('assert');
var matchPath = require('../lib/pathMatcher.js');

//we will be using arbitrary paths made out of lists of charachters
function makePath(list) {
	function pc(val,optional){
		var ret = {};
		ret.val = val;

		ret.matches = function(v){
			return v === val
		};

		ret.isOptional = optional || false;
		return ret;
	}

	return list.map(function(val){
		if(val === '*'){
			return {
				'isSplat' : true,
				'isOptional' : true
			};
		}
		else if(val === '+'){
			return {
				'isSplat' : true,
				'isOptional' : false
			}
		}
		if(val.indexOf('?') !== -1){
			return pc(val.substring(0,val.length-1),true);
		}
		else{
			return pc(val,false);
		}
	});
}

suite('test the path matching function',function(){

	test('path without optional parameters',function(done){
		var test = ['a','b','c']
		var path = makePath(test);

		assert.notEqual(false,matchPath(path,test),'the path should match the list that created it');
		assert.equal(false,matchPath(path,['a','c','x']),'the path should not match a list with incorrect values');
		assert.equal(false,matchPath(path,['a','b']),'the path should not match a list with too few values');
		assert.equal(false,matchPath(path,['a','b','c','d']),'the path should not match a list with too mant values');

		done();
	});

	test('path with optional parameters',function(done){
		var path = makePath(['a','a?','b','b?']);

		assert.notEqual(false,matchPath(path,['a','b']),'the path should match with no optional parameters present');
		assert.notEqual(false,matchPath(path,['a','a','b']),'the path should match with only the first optional parameter present');
		assert.notEqual(false,matchPath(path,['a','b','b']),'the path should match with only the second optional parameter present');
		assert.notEqual(false,matchPath(path,['a','a','b','b']),'the path should match with both optional parameters present');

		assert.equal(false,matchPath(path,['a','c','b']),'the path should not match a list with incorrect values for optional parameters');
		assert.equal(false,matchPath(path,['a','a']),'the path should not match when required parameters are missing');
		assert.equal(false,matchPath(path,['a','a','b','b','c']),'the path should not match when extra parameters are added');

		done();

	});

	test('path with repeating parameters (necessitating further backtracking)',function(done){
		var path = makePath(['a?','a','a','a?','a','a']);
		assert.notEqual(false,matchPath(path,['a','a','a','a']),'the path should match with no optional parameters present');
		assert.equal(5,matchPath(path,['a','a','a','a','a']).length,'the matching result should have the proper amount of matched pairs');
		done();
	})

	test('path with optional params and required splat',function(done){
		var path = makePath(['a','b?','+']);

		assert.notEqual(false,matchPath(path,['a','c','d']),'the path should match with no optional parameters, but extra splat present');
		assert.notEqual(false,matchPath(path,['a','b','b','d','q']),'the path should match with only the first optional parameter present');

		var splatMatches = matchPath(path,['a','c','e']);
		assert.deepEqual(['c','e'],splatMatches[1].matched,'the splat matches should contain all the extra values');

		assert.equal(false,matchPath(path,['a']),'the route should not match with no optional prarms and no splat');
		assert.equal(false,matchPath(path,['a','b']),'the route should not match with optional prarms and no splat');

		done();
	});

	test('path with optional params and non required splat',function(done){
		var path = makePath(['a','b?','*']);
		assert.notEqual(false,matchPath(path,['a','c','d']),'the path should match with no optional parameters, but extra splat present');
		assert.notEqual(false,matchPath(path,['a','b','b','d','q']),'the path should match with only the first optional parameter present');

		var splatMatches = matchPath(path,['a','c','e']);
		assert.deepEqual(['c','e'],splatMatches[1].matched,'the splat matches should contain all the extra values');

		splatMatches = matchPath(path,['a']);
		assert.equal(1,splatMatches.length,'the splat parameter should not have any matches');

		assert.notEqual(false,matchPath(path,['a']),'the route should match with no optional prarms and no splat');
		assert.notEqual(false,matchPath(path,['a','b']),'the route should match with optional prarms and no splat');

		done();
	});

})
