var express = require('express');
var bodyParser = require('body-parser');
var _ = require('underscore');

var app = express();
var PORT = process.env.PORT || 3000;
var todos = [];
var todoNextId = 1;


app.use(bodyParser.json());


app.get('/', function(req,res){
	res.send('Todo API Root');
});

// GET/todos
app.get('/todos', function(req, res){
	res.json(todos);
});

// GET/todos/:id
app.get('/todos/:someId', function(req, res){		
	// searching for a todo with a matching id in the todos array 
	// by use of the _.findWhere method
	// the id has to match the request parameters entered -> someId
	var matchedTodo = _.findWhere(todos, { id: parseInt(req.params.someId) });
	if (matchedTodo){
		res.json(matchedTodo);
	} else {
		res.status(404).send();
	}	
});

// POST /todos
app.post('/todos', function(req, res){
	// use the _.pick method to maintain only the
	// 'description' and 'completed' key-value pairs
	// even if more keys and values are posted with the request object

	var body = _.pick(req.body, 'description', 'completed'); 
	// use the postman app to post a json object such as
	// {"description": "buy milk",	"completed": false}
	if ( !_.isString(body.description) || !_.isBoolean(body.completed)
		|| body.description.trim().length === 0 )
		return res.status(400).send();


	// add id field and increase the todoNextId var by one
	body.id = todoNextId++;

	// clear description from blanks
	body.description = body.description.trim();

	// push body to the todos array
	todos.push(body);


	// response shown down the page in postman
	res.json(body);
});

// DELETE/todos/:id
app.delete('/todos/:someId', function(req, res){
	// searching for a todo with a matching id in the todos array 
	// by use of the _.findWhere method
	// the id has to match the request parameters entered -> someId
	var matchedTodo = _.findWhere(todos, { id: parseInt(req.params.someId) });
	if (matchedTodo){
		todos = _.without(todos, matchedTodo);
		res.json(matchedTodo);
		//res.status(200).send();
	} else {
		res.status(404).send().json({"error" : "no todo found with that id"});
	}	
});


app.listen(PORT, function(){
	console.log('Express server started on port ' + PORT);
});