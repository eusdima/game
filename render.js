module.exports = function(io,size){
	return{
		data:[],
		init:function(){
			this.data= new Array(size);
			for (j=0;j<size;j++)
				this.data[j]= new Array(size);
			for (i=0;i<size;i++)
				for (j=0;j<size;j++)
					this.data[i][j]={};
		},
		verifycollision:function(x,y)
		{
			if (this.data[x][y].action=='draw')
				return 'snake';
			if (this.data[x][y].action=='fruit')
				return 'fruit';
			return null;
		},
		add:function(array)
		{
			var i;
			for (i=0;i<array.length;i++)
			{
				if (array[i].data==null)
					array[i].data='green';
				this.data[array[i].x][array[i].y].value=array[i].data;
				this.data[array[i].x][array[i].y].action='draw';
			}
		},
		addpoint:function(x,y,color,action)
		{
			this.data[x][y]={
				action:action,
				value:color
			};
		},
		deletepoint:function(x,y){this.data[x][y].action='delete';},
		deletesnake:function(array){
			for (i=0;i<array.length;i++)
			{
				
				this.data[array[i].x][array[i].y].action='delete';
			}
		},
		send:function()
		{
			io.emit('canvas:render',this.data);
			//console.log('Render');
			//this.init();
		}
	}
};