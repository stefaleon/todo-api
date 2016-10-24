express = require('express');
var app = express();
var PORT = process.env.PORT || 3000;
var todos = [{
	id: 1,
	description: 'buy milk',
	completed: false
}, {
	id: 2,
	description: 'pay phone bill',
	completed: false
}, {
	id: 3,
	description: 'eat all chocolates',
	completed: true
}
];


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



app.listen(PORT, function(){
	console.log('Express server started on port ' + PORT);
});