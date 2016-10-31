var express = require('express');
var bodyParser = require('body-parser');
var _ = require('underscore');
var db = require('./db.js');
var bcrypt = require('bcryptjs');
var middleware = require('./middleware.js')(db);

var app = express();
var PORT = process.env.PORT || 3000;
var todos = [];
var todoNextId = 1;


app.use(bodyParser.json());


app.get('/', function(req, res) {
	res.send('Todo API Root');
});


// GET/todos?completed=boolean&q=someString 
app.get('/todos', middleware.requireAuthentication, function(req, res) {
	// if there is no query whereObj will remain empty
	var whereObj = {
		// get those todos where their userId matches the requesting user id
		userId: req.user.get('id')
	};

	// filtering with the 'completed' key
	if (req.query.hasOwnProperty('completed') && req.query.completed === "true") {
		whereObj.completed = true;
	} else if (req.query.completed === "false") {
		whereObj.completed = false;
	}

	// filtering with the 'description' key	
	if (req.query.hasOwnProperty('q') && req.query.q.length > 0) {
		whereObj.description = {
			$like: '%' + req.query.q + '%'
		};
	}

	db.todo.findAll({
		where: whereObj
	}).then(function(todos) {
			res.json(todos);
		},
		function() {
			res.status(500).send();
		});

});


// GET/todos/:id
app.get('/todos/:someId', middleware.requireAuthentication, function(req, res) {

	// searching for a todo with a matching id 	
	// the id has to match the request parameters entered -> someId
	var requestedId = parseInt(req.params.someId);

	db.todo.findOne({
		where: {
			id: requestedId,
			userId: req.user.get('id')
		}
	}).then(function(todo) {
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
app.post('/todos', middleware.requireAuthentication, function(req, res) {

	// use the _.pick method to maintain only the
	// 'description' and 'completed' key-value pairs
	// even if more keys and values are posted with the request object
	var body = _.pick(req.body, 'description', 'completed');

	db.todo.create(body).then(function(todo) {
		req.user.addTodo(todo).then(function() {
			return todo.reload();
		}).then(function(todo) {
			res.json(todo.toJSON());
		});
	}).catch(function(e) {
		res.status(400).json(e);
	});

});


// DELETE/todos/:id
app.delete('/todos/:someId', middleware.requireAuthentication, function(req, res) {

	// searching for a todo with a matching id	
	// the id has to match the request parameters entered -> someId
	var requestedId = parseInt(req.params.someId);


	db.todo.destroy({
		where: {
			id: requestedId,
			userId: req.user.get('id')
		}
	}).then(function(rowsDeleted) {
		if (rowsDeleted === 0) {
			res.status(404).send();
		} else {
			res.status(204).send();
		}
	}, function() {
		res.status(500).send();
	});

});



// PUT/todos/:id
app.put('/todos/:someId', middleware.requireAuthentication, function(req, res) {

	// use the _.pick method to maintain only the
	// 'description' and 'completed' key-value pairs
	// even if more keys and values are being send with the request object
	var body = _.pick(req.body, 'description', 'completed');
	var requestedId = parseInt(req.params.someId);
	var attributes = {};

	// check if 'completed' exists 
	// then add to validAttributes object
	if (body.hasOwnProperty('completed')) {
		attributes.completed = body.completed;
	}

	// check if 'description' exists 
	// then add to validAttributes object
	if (body.hasOwnProperty('description')) {
		attributes.description = body.description;
	}

	// searching for a todo with a matching id 	
	// the id has to match the request parameters entered -> someId
	db.todo.findOne({
		where: {
			id: requestedId,
			userId: req.user.get('id')
		}
	}).then(function(todo) {
		if (todo) {
			todo.update(attributes).then(function(todo) {
				res.json(todo.toJSON());
			}, function(e) {
				res.status(400).json(e);
			});
		} else {
			res.status(404).send();
		}
	}, function() {
		res.status(500).send();
	});

});


// POST /users
app.post('/users', function(req, res) {
	var body = _.pick(req.body, 'email', 'password');

	db.user.create(body).then(function(user) {
		res.status(200).json(user.toPublicJSON());
	}, function(e) {
		res.status(400).json(e);
	});

});


// POST /users/login
app.post('/users/login', function(req, res) {
	var body = _.pick(req.body, 'email', 'password');

	db.user.authenticate(body).then(function(user) {
		var token = user.generateToken('authentication');
		if (token) {
			res.header('Auth', token).json(user.toPublicJSON());
		} else {
			res.status(401).send();
		}
	}, function() {
		res.status(401).send();
	});

});


db.sequelize.sync({
	//force: true
}).then(function() {
	app.listen(PORT, function() {
		console.log('Express server started on port ' + PORT);
	});
});