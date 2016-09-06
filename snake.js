//variables
//function
var Template=function Snake(Render,Fruit,socket){
	Render.init();
	var size=global.size;
	this.data=[{x:5,y:5},{x:6,y:5},{x:7,y:5},{x:8,y:5}];
	this.direction='S';
	this.speed=50;
	this.socket=socket;
	this.enabled=true;
	this.food=0;
	this.lives=5;
	this.score=0;
	var self = this;
	var Firebase = require("firebase");
	var DB = new Firebase("https://snakeeusdima.firebaseio.com/");

	self.data[self.data.length-1].data='red';
	this.stats=function()
	{
		this.socket.emit('update:value',{
			target:".lives-value",
			data:this.lives
		});
		this.socket.emit('update:value',{
			target:".score-value",
			data:this.score
		});
	}
	this.speedbuff=function(value,duration)
	{
		self.speed+=value;
		setTimeout(function(){
			self.speed-=value;
		},duration);
	}
	this.sizebuff=function(value,duration)
	{
		var x=this.data.length;
		self.food+=value;
		setTimeout(function(){
			self.remove(value);
		},duration);
	}
	this.kill=function()
	{
		self.enabled=false;
		Render.deletesnake(socket.snake.data);
		this.socket.emit("game-over");
		socket.broadcast.emit('notification','A player has died');
	}
	this.remove=function(size)
	{
		if (self.data.length>size+1)
		{
			for (i=0;i<size;i++)
				Render.deletepoint(self.data[i].x,self.data[i].y);
			self.data.splice(0,size);
		}
	}
	this.move=function()
	{
		if (self.enabled==false)
			return 0;
		var direction=self.direction;
		var x=self.data[self.data.length-1];
		var y=x.y;
		x=x.x;
		if (direction=="E")	{x++; if (x>=size)x=0;}
		if (direction=="V") {x--; if (x==-1)x=size-1;}
		if (direction=="S") {y++; if (y>=size)y=0;}
		if (direction=="N") {y--; if (y==-1)y=size-1;}
		//self.data[self.data.length]={x:x,y:y};
		var last={x:x,y:y};//move coords from nth to nth-1
		var temporary={};
		
		for (var i=self.data.length-1;i>=0;i--)
		{
			//temporary=Object.assign(self.data[i]);
	
			temporary=Object.assign({},self.data[i]);
			self.data[i].x=last.x;
			self.data[i].y=last.y;
			last=Object.assign({},temporary);

			//console.log(last);
		}
		//console.log(self.data);
		//console.log(size);
		var collision=Render.verifycollision(x,y);
		if (self.food>0)
			self.food--;
		if (collision=="fruit")
		{
			
			Fruit.generate();
			self.food+=Fruit.value;
			self.score+=Fruit.value;
			//socket.ScoreRef.set({value:(0-self.score)});
			self.speedbuff(Fruit.speed,5000);
		}
		if (self.food>0)
		{
			self.data.unshift(last);
		}
		if (collision=="snake")
		{
			console.log('impact');
			Render.deletepoint(last.x,last.y);
			if (self.lives<=1)
			{
				self.kill();
				return 0;
			}
			else
			{
				self.lives--;
				self.socket.emit('notification','You have '+self.lives+' lives left');
				self.SwapDirection();
			}
		}
		if (collision==null)
		{
			Render.deletepoint(last.x,last.y);
			//self.data.splice(0,1);
		}

		self.stats();
		self.draw();
		setTimeout(self.move,self.speed);
	};
	this.SwapDirection=function()
	{
		self.data.reverse();
		self.data[self.data.length-1].data='red';
		for (var i=self.data.length-2;i>=0;i--)
			self.data[i].data='green';
		self.remove(3);
		if (self.direction=="E"){ self.direction="V";return 0;}
		if (self.direction=="V"){ self.direction="E";return 0;}
		if (self.direction=="S"){ self.direction="N";return 0;}
		if (self.direction=="N"){ self.direction="S";return 0;}
	}
	this.draw=function()
	{
		
		Render.add(self.data);
	
	};
	self.draw();
	self.move();
};

module.exports.Template=Template;


