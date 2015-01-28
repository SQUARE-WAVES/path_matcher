WARPATH-MATCHER
===============

#(Round 2 of the warpath suite of helpfully named tools)

checkout if paths match descriptions of paths its ALL OUT PATH COMBAT, here on the field of SEEING IF PATHS MATCH A DESCRIPTION IN A SCHEMA.

#Hey what's the big idea here?

the idea here is to take descriptions of routes, and see if incoming requests match them, all from a big central description that you can pass to other sites.

the idea is to use this in conjunction with [warpath](https://github.com/SQUARE-WAVES/route_generator) to make sites that give manifests of all their routes, such that when you change the server the clients can easily adapt.


#ok, so how does this work?

you start with a schema that looks something like this:

```javascript
var schema = {
	'protocol':'http:',
	'hostname':'dogzone.com',
	'port':8080,
	'pathDescription':{
		'path':'/dogs/:breed',
		'params':{
			'breed':{
				'values':['corgi','borzoi','pitbull','dracula hound']
			}
		}
	}
}
```

actually it really only needs to have the path information. The rest would be usful if you are using this with a client that has a url generator, but it's not neccesary. so you could also just have:

```javascript
var schema = {
	'pathDescription':{
		'path':'/dogs/:breed',
		'params':{
			'breed':{
				'values':['corgi','borzoi','pitbull','dracula hound']
			}
		}
	}
}
```

it's a description of a parameterized path, with descriptions of the parameters as well. You would then create a matcher object that could be used with this

```javascript
var createPathMatcher = require("warpath-matcher");

var matchesPath = createPathMatcher(schema);

matchesPath("/dogs/borzoi") //should be true!
matchesPath("/cats/whatever") //totally false!
matchesPath("/dogs/dachshund") //nope, bad parameter value!

```

in the case that a parameterized route is matched, the matcher function will return an object with keys corresponding to the matched parameters, and values corresponding to what was in the path, so for example "/dogs/borzoi" would return the object

```javascript
{
	"breed":"borzoi"
}
```

#what about queries?
warpath deals with generating queries, but this thing here doesn't deal with matching them, while matching queries is an important thing if you want to have restricted query values it shoudln't be handled in the same place as matching paths.

#what about performance?

the algorithm the path matcher uses is based on breaking up paths into tokens, then matching those tokens. If you don't hvae any optional params it's guaranteed to be O(n) where n is the number of tokens in your path. A token being a thing inbetween '/' characters. Given that you typically have on the order of 3 or 4 tokens in a path this means it runs really fast.

However when you add optional parameters you run a risk of creating paths that are occasionally hard to match, but fortunately this is a pretty weird case and you are not likely to ever want to do it. Here is an example of a hard to match path

```javascript
var schema = {
	'pathDescription':{
		'path':'/dogs/:breed?/:breed/:breed/:breed/:breed?/:breed',
		'params':{
			'breed':{
				'values':['corgi','borzoi','pitbull','dracula hound']
			}
		}
	}
}
```

basically when you have the same thing over and over again, sometimes optionally the matcher has to do a lot of backtracking to make sure it has matched correctly.