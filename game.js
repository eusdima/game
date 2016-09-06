//variables
var $canvas = $('#snake');
var canvas = $canvas[0];
var ctx = canvas.getContext('2d');
var Draw={};
canvas.size=100;
//functions
Draw.ClearCanvas=function()
{
	ctx.clearRect(0, 0, canvas.size, canvas.size); 
}
Draw.Point=function(x,y,size,color)
{
	ctx.fillStyle = color;
	ctx.fillRect(x, y, size, size);
}
Draw.ClearPoint=function(x,y,size)
{
	ctx.clearRect(x, y, size, size); 
}
Draw.Snake=function(data)
{
	var i;
	for (i=0;i<data.length;i++)
	{
		Draw.Point(data[i].x,data[i].y,1,'red');
	}
}



var game=function()
{
	if ($( window ).height()>$( window ).width())
	{
		$canvas.css({'width':'99%','height':'auto'});
	}
	else
		$canvas.css({'width':'auto','height':'99%'});
	
	//Fruit.Draw();
	//Snake.move(Snake.direction);
	for (i=0;i<canvas.size;i++)
		for (j=0;j<canvas.size;j++)
			Draw.Point(i,j,1,DefaultColor(i,j));
}
game();
//window.setInterval(game, Snake.speed);
//events
$(window).resize(function(){
	if ($( window ).height()>$( window ).width())
	{
		$canvas.css({'width':'99%','height':'auto'});
	}
	else
		$canvas.css({'width':'auto','height':'99%'});
});
$(window).keydown(function(e) {
	console.log(e.keyCode);
	var Direction;
	if (e.keyCode=='39')
		Direction='E';
	if (e.keyCode=='40')
		Direction='S';
	if (e.keyCode=='37')
		Direction='V';
	if (e.keyCode=='38')
		Direction='N';
	if (e.keyCode>=37&&e.keyCode<=40)
		socket.emit("player:move",Direction);
});
//functions
function count_notification()
{
	var number=$(".toast").length;
	console.log(number);
	if (number>5)
		number='5+';
	if (number==0)
		$(".notification-count").hide();
	else
		$(".notification-count").show();
	$(".notification-count").text(number);
}
$( ".respawn" ).click(function() {
  location.reload();
});
setInterval(count_notification,500);
//socket
var socket = io('http://192.168.0.26:1234');
socket.on('connect', function () {
	socket.emit('game:connect', { name: 'Eus' });
});

function hidenotification(x)
{
	setTimeout(function(){x.hide()}, 5000);
}

socket.on('notification', function (data) {
	//$(".notification-panel").append("<div class='notification-msg'  id='hideMe'>"+data+"</div>");
	//var t=$(".notification-panel > div:last-of-type");
	Materialize.toast(data, 1000); 
	
	//hidenotification(t);
});
socket.on('update:value',function(data){
	
	$(data.target).text(data.data);
});
function DefaultColor(x,y)
{
	return 'white';
}
socket.on('canvas:render',function(data)
{
	var i,j;

	for (i=0;i<canvas.size;i++)
		for (j=0;j<canvas.size;j++)
		{
			if (data[i][j].action=='draw')
				Draw.Point(i,j,1,data[i][j].value);
			if (data[i][j].action=='fruit')
				Draw.Point(i,j,1,data[i][j].value);
			if (data[i][j].action=='delete')
			{
				Draw.ClearPoint(i,j,1);
				Draw.Point(i,j,1,DefaultColor(i,j));
			}

		}
	});
socket.on('game-over',function()
{
	$(".gameover").show();
});