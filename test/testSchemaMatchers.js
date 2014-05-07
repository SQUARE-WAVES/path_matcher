var assert = require('assert');
var createMatcher = require('../index.js');

suite('test the schema matchers',function(){

	test('unparameterized route', function (done)  {
		var schema = {
			'path':'/dogs/cats/bears'
		}

		var matcher = createMatcher(schema);

		assert.ok(matcher(schema.path),'the schema should match the path it was generated with');
		assert.equal(false,matcher('/dogs/cats/asdf'),'the schema should not match a different route');
		assert.equal(false,matcher('/dogs/cats/bears/more'),'the schema should not match an extended route');
		done();
	});

	test('parameterized route without options',function(done){

		var schema = {
			'path':'/hello/:name',
			'params':{
				'name':{
					'type':'path',
					'values':[
						'charles',
						'barnabus'
					]
				}
			}
		};

		var matcher = createMatcher(schema);

		assert.ok(matcher('/hello/charles'),'the schema should match a correct instance');
		assert.equal(false,matcher('/hello/512!'),'the schema should not match an incorrect instance');
		assert.equal(false,matcher('/hello/charles/jones'),'the schema should not match an extended instance');
		assert.deepEqual({'name':'barnabus'},matcher('/hello/barnabus'),'the extraction should retrieve the name parameter');

		done();
	});

	test('parameterized route with options',function(done){
		var schema = {
			'path':'/hello/:title?/:name',
			'params':{
				'name':{
					'type':'path',
					'values':[
						'charles',
						'barnabus'
					]
				},
				'title':{
					'type':'path',
					'regex':'\\w+'
				}
			}
		};

		var matcher = createMatcher(schema);

		assert.deepEqual({'name':'charles'},matcher('/hello/charles'),'the schema should match a correct instance without the options');
		assert.deepEqual({'name':'charles','title':'doctor'},matcher('/hello/doctor/charles'),'the schema should match a correct instance with the options');

		assert.equal(false,matcher('/hello/512!'),'the schema should not match an incorrect instance without the options');
		assert.equal(false,matcher('/hello/!!!/jones'),'the schema should not match an incorrect instance with the otptions');

		done();
	});

	test('parameterized route with splat',function(done){
		var schema = {
			'path':'/hello/:name/*extra',
			'params':{
				'name':{
					'type':'path',
					'values':[
						'charles',
						'barnabus'
					]
				},
				'title':{
					'type':'path',
					'regex':'\\w+'
				}
			}
		};

		var matcher = createMatcher(schema);

		assert.deepEqual({'name':'charles'},matcher('/hello/charles'),'the schema should match a correct instance without the splat');
		assert.deepEqual({'name':'charles','extra':['a','b','c','d']},matcher('/hello/charles/a/b/c/d'),'the schema should match a correct instance with the splat');

		assert.equal(false,matcher('/hello/512!'),'the schema should not match an incorrect instance without the splat');
		assert.equal(false,matcher('/hello/!!!/jones'),'the schema should not match an incorrect instance with splat');

		done();
	});

});