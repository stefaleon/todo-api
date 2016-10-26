var express = require('express');
var bodyParser = require('body-parser');
var _ = require('underscore');
var db = require('./db.js');

var app = express();
var PORT = process.env.PORT || 3000;
var todos = [];
var todoNextId = 1;


app.use(bodyParser.json());


app.get('/', function(req, res) {
	res.send('Todo API Root');
});

// GET/todos 
// or GET/todos?completed=(true/false)&q=(string_contained_in_description) 
app.get('/todos', function(req, res) {
	filteredTodos = todos;

	// filtering with the 'completed' key
	if (req.query.completed === "true") {
		filteredTodos = _.where(filteredTodos, {
			completed: true
		});
	} else if (req.query.completed === "false") {
		filteredTodos = _.where(filteredTodos, {
			completed: false
		});
	}

	// filtering with the 'description' key
	// filtered array contains the objects that
	// contain the query string in the description-value
	if (req.query.hasOwnProperty('q') && req.query.q.length > 0) {
		filteredTodos = _.filter(filteredTodos, function(todo) {
			return todo.description.toLowerCase().indexOf(req.query.q) >= 0;
		});
	}


	res.json(filteredTodos);
});

// GET/todos/:id
app.get('/todos/:someId', function(req, res) {

	// searching for a todo with a matching id 	
	// the id has to match the request parameters entered -> someId
	var requestedId = parseInt(req.params.someId);

	db.todo.findById(requestedId).then(function(todo) {
			if (!!todo) {
				res.json(todo.toJSON());
			} else {
				res.status(404).send();
			}
		},
		function(e) {
			res.status(500).send();
		});

});

// POST /todos
app.post('/todos', function(req, res) {

	// use the _.pick method to maintain only the
	// 'description' and 'completed' key-value pairs
	// even if more keys and values are posted with the request object
	var body = _.pick(req.body, 'description', 'completed');

	db.todo.create(body).then(function(todo) {
		res.status(200).json(todo.toJSON());
	}).catch(function(e) {
		res.status(400).json(e);
	});

});

// DELETE/todos/:id
app.delete('/todos/:someId', function(req, res) {
	// searching for a todo with a matching id in the todos array 
	// by use of the _.findWhere method
	// the id has to match the request parameters entered -> someId
	var matchedTodo = _.findWhere(todos, {
		id: parseInt(req.params.someId)
	});
	if (matchedTodo) {
		// remove the matched todo from the todos array
		todos = _.without(todos, matchedTodo);
		res.json(matchedTodo);
		//responding with the deleted todo instead of res.status(200).send();
	} else {
		res.status(404).send().json({
			"error": "no todo found with that id"
		});
	}
});

// PUT/todos/:id
app.put('/todos/:someId', function(req, res) {

	// use the _.pick method to maintain only the
	// 'description' and 'completed' key-value pairs
	// even if more keys and values are being send with the request object
	var body = _.pick(req.body, 'description', 'completed');
	var validAttributes = {};

	// check if 'completed' exists and validates
	// then add to validAttributes object
	if (body.hasOwnProperty('completed') && _.isBoolean(body.completed)) {
		validAttributes.completed = body.completed;
	} else if (body.hasOwnProperty('completed')) {
		res.status(404).send()
	}

	// check if 'description' exists and validates
	// then add to validAttributes object
	if (body.hasOwnProperty('description') &&
		_.isString(body.description) &&
		body.description.trim().length > 0) {
		validAttributes.description = body.description;
	} else if (body.hasOwnProperty('description')) {
		res.status(404).send()
	}


	// searching for a todo with a matching id in the todos array 
	// by use of the _.findWhere method
	// the id has to match the request parameters entered -> someId
	var matchedTodo = _.findWhere(todos, {
		id: parseInt(req.params.someId)
	});
	if (matchedTodo) {
		// update the matched todo
		_.extend(matchedTodo, validAttributes);
		res.json(matchedTodo);
		//responding with the matched todo instead of res.status(200).send();
	} else {
		res.status(404).send().json({
			"error": "no todo found with that id"
		});
	}
});

db.sequelize.sync().then(function() {
	app.listen(PORT, function() {
		console.log('Express server started on port ' + PORT);
	});
});