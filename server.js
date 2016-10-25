var express = require('express');
var bodyParser = require('body-parser');

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
	todos.forEach(function(todo){
		if (todo.id === parseInt(req.params.someId)){
			res.json(todo);
		}
	});
	res.status(404).send();
});

// POST /todos
app.post('/todos', function(req, res){
	var body = req.body; 
	// use the postman app to post a json object such as
	// {"description": "buy milk",	"completed": false}
	body.id = todoNextId;
	todoNextId++;
	todos.push(body);


	// response shown down the page in postman
	res.json(body);
});



app.listen(PORT, function(){
	console.log('Express server started on port ' + PORT);
});