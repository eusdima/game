var express = require('express'),
path = require('path'),
app = express();
var io = require('socket.io');
var http=require('http');
var server = http.createServer();
server.listen(1234,'192.168.0.26');
var io = io.listen(server);
var Render=require("./render.js")(io,100);
var Snake=require("./snake.js").Template;
var Firebase = require("firebase");
//variables
var players=[];
global.size=100;
var DB = new Firebase("https://snakeeusdima.firebaseio.com/");
Render.init();

//DB START

function dbinit()
{
	DB.child("test").set(null);  
}
function randomString(size)
{
	var x='';
	var Dictionary='ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
	var i=0;
	while (i<size)
	{
		var c=Dictionary[parseInt(Math.random()*Dictionary.length)];
		x+=c;
		i++;
	}
	return x;
}
randomString(10);
function addArray()
{
	var X=new Array();
	X.push({val:5});
	X.push({val:5});
	X.push({val:5});
	X.push({val:5});
	console.log(X);
	DB.child('test').set(X);  
}
function SortScores(data){
	DB.child("test").once('value', function (dataSnapshot) {
  
  		unSortedArray=dataSnapshot.val();
  		//console.log(unSortedArray);
  		//console.log(unSortedArray);
  		if (unSortedArray==null)
  			unSortedArray=[];
  		unSortedArray.push(data);
  		unSortedArray.sort(function(a, b){return b.val-a.val});
  		DB.child('test').set(unSortedArray);
  		//unSortedArray.sort(function(a, b){return a.val-b.val});
	});
}
function SendScores()
{
	var ref = new Firebase("https://snakeeusdima.firebaseio.com/MaxValues");
	ref.orderByChild('value').on("value", function(snapshot) {
 		console.log(snapshot.val());
	});
}
//setInterval(SendScores,2000);
//addArray();
SortScores({val:51,name:'eus'});


//DB END

//Render.send();
//game classes

var game=function()
{
	var i;
	Fruit.Draw();
	Render.send();
}
setInterval(game,10);
//fruit
var Fruit={
	data:{x:10,y:10},
	value:1,
	color:'green',
	left:1,
	Draw:function()
	{
		left=1;
		Render.addpoint(this.data.x,this.data.y,this.color,'fruit');
	},
	generate:function()
	{
		var NrTypes=4;
		var x=Math.floor((Math.random() * global.size/5) );
		var y=Math.floor((Math.random() * global.size/5) );
		if (Math.floor((Math.random() * 100) )<=60)
		{
			this.value=1;
			this.speed=0;
			this.color='green';
		}
		else if (Math.floor((Math.random() * 100))<=40 )
		{
			this.value=2;
			this.speed=0;
			this.color='blue';
		}
		else if (Math.floor((Math.random() * 100))<=20 )
		{
			this.value=3;
			this.speed=20;
			this.color='orange';
		}
		else if (Math.floor((Math.random() * 100))<=20 )
		{
			this.value=4;
			this.speed=-20;
			this.color='#550000';
		}
		else
		{
			this.value=1;
			this.speed=0;
			this.color='green';
		}
		Fruit.data.x=x;
		Fruit.data.y=y;
	}
};
//routes
app.get('/', function(req, res) {
    res.sendFile(path.join(__dirname, 'index.html'));
});
app.get('/game.js', function(req, res) {
    res.sendFile(path.join(__dirname, 'game.js'));
});
//socket.io callbacks
io.on('connect',function(socket)
{
	console.log('A player has joined the game');
	console.log(socket.id);
	socket.broadcast.emit('notification','A player has joined the game');
	socket.eID
	socket.ScoreRef=DB.child('MaxValues').push({value:0});
	socket.ScoreId = socket.ScoreRef.name();
	socket.on('game:connect',function(data){
		
		if (socket.snake!=null)
			socket.snake.enabled=false;			
		socket.gamedata=data;
		socket.snake=new Snake(Render,Fruit,socket);
		players.push(socket);
	});
	socket.on('game:disconnect',function(data){
		socket.gamedata=null;
		socket.snake=null;
		DeletePlayer(socket);
		console.log('asdasdasd');
	});
	socket.on('array',function(){
		console.log(players);
	});
	socket.on('player:move',function(data){
		
		if ( ((socket.snake.direction=='S'&&data=='N')||(socket.snake.direction=='N'&&data=='S')||(socket.snake.direction=='E'&&data=='V')||(socket.snake.direction=='V'&&data=='E'))==false )
			socket.snake.direction=data;
	});
	socket.on('disconnect',function(data)
	{
		players.splice(players.indexOf(socket),1);
		socket.snake.enabled=false;
		Render.deletesnake(socket.snake.data);
		console.log("A player has left the game");
	});
});

app.listen(80,'192.168.0.26');