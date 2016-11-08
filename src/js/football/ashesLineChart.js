function LineChart(data,options) {
	console.log(options.series)
	var container = d3.select(options.container);

	var viz=container.append("div").attr("class","timeline-chart");

	var size=viz.node().getBoundingClientRect(),
    	WIDTH = size.width,
    	HEIGHT = 200;//size.height;

   	//console.log(WIDTH,HEIGHT)

    var margins={
    	left:20,
    	right:100,
    	top:40,
    	bottom:25
    };

    var tooltip=new Tooltip({
    	container:viz.node(),
    	margins:margins,
    	info:options.info,
    	teams:options.teams
    })

    var extents;

    function setExtents() {
		extents={
			index:[0,options.series.length-1],
			date:d3.extent(options.series,function(d){
				return d.date;
			}),
			customVals:[
				0,
				d3.max(options.series,function(d){
					
					return Math.max(d.attendanceNum);
				})
			]
		};

	};

	setExtents();

	

	var periods=getPeriods(options.series);
	
	console.log(periods)
	
	var svg=viz.append("svg")
				.attr("width","100%")
				.attr("height","100%");
			addPattern(svg);

	var timeline_g=svg.append("g")
					.attr("class","lines")
					.attr("transform","translate("+(margins.left)+","+margins.top+")"),
		axes=svg.append("g")
					.attr("class","axes")
					.attr("transform","translate("+(margins.left)+","+margins.top+")");

	

	var xscale=d3.scale.linear().domain(extents.date).range([0,WIDTH-(margins.left+margins.right)]),
		yscale=d3.scale.linear().domain(extents.customVals).range([HEIGHT-(margins.top+margins.bottom),0]);

	var line = d3.svg.line()
				    .x(function(d) { return xscale(d.date); })
				    .y(function(d) { 
				    	////console.log(d.date,d.customVals)
				    	return yscale(d.customVals); 
				    })
				    //.interpolate("basis")
				    .interpolate("step-after");

	
	var notes=timeline_g
			.append("g")
				.attr("class","notes")
			.selectAll("g.note")
				.data(data.filter(function(d){
					return typeof d.values.notes != "undefined";
				}))
				.enter()
				.append("g")
					.attr("class","note")
					.attr("transform",function(d){
						var x=Math.round(xscale(d.values.dateObj)),
							y=yscale(Math.max(d.values.attendanceNum))
						return "translate("+x+","+(y-40)+")";
					});
	/*
	notes.append("line")
			.attr("x1",0)
			.attr("x2",0)
			.attr("y1",0)
			.attr("y2",25);
	notes.append("circle")
		.attr("cx",0.5)
		.attr("cy",0)
		.attr("r",2.5)*/
	var teams=timeline_g.selectAll("g.team")
			.data(["LIV","EVE"])
			.enter()
			.append("g")
				.attr("class",function(d){
					return "team "+d;
				})
	var period=teams.selectAll("g.period")
			.data(function(d){
				return periods.map(function(p){
					return {
						team:d,
						period:p.values
					}
				})
			})
			.enter()
			.append("g")
				.attr("class","period");
	
	period.append("path")
			.attr("d",function(p){
				
				return line(p.period.map(function(d){
					console.log(d)
					return {
						date:d.dateObj,
						customVals:d.attendanceNum
					}
				}))
			});

	svg.on("mousemove",function(d){
				var x=d3.mouse(this)[0];

				x=Math.min(WIDTH-margins.right,x);
				var series=findBar(Math.round(xscale.invert(x-margins.left)))
				
				if(series) {
					
					var status=data.find(function(d){
						return +d.values.date == +series.date;
					});

					tooltip.show(series,xscale(series.date),0,status);//yscale.range()[0]);
					highlightSeries(series.date);
				}
				

			})
			.on("mouseleave",function(d){
				highlightSeries();
				tooltip.hide();
			})

	function findBar(x) {
		//console.log(x,new Date(x))
		var i=0,
			bar=options.series.find(function(d){
				return d.date >= x;
			});

		
		return bar;
	}
	
	var series=period.filter(function(d,i){
		
		return i%2;
	}).selectAll("g.series")
		.data(options.series)
		.enter()
			.append("g")
			.attr("class","series")
			.attr("transform",function(d){
				console.log(d)
				return "translate("+xscale(d.dateObj)+",0)";
			})
			.on("mouseenter",function(d){
				tooltip.show(d,xscale(d.key),100);
			})
			.append("line")
				.attr("x1",0)
				.attr("y1",function(s){
					var status=data.find(function(d){
						return +d.dateObj == +s.dateObj;
					});
					return yscale(Math.max(status.values["LIV"],status.values["EVE"]))+1;
				})
				.attr("x2",0)
				.attr("y2",function(s){
					return yscale.range()[0]+4;
					/*var status=data.find(function(d){
						return +d.values.date == +s.date;
					});
					return yscale(status.values["EVE"])*/
				})
	function highlightSeries(date) {
		if(!date) {
			series.classed("highlight",false);
		}
		series.classed("highlight",function(d){
			return +d.dateObj == +date;
		});
	}

	teams.append("text")
			.attr("class","status")
			.attr("x",function(d){
				return xscale(data[data.length-1].dateObj)
			})
			.attr("y",function(d){
				return yscale(data[data.length-1].attendanceNum)
			})
			.attr("dy",function(d){
				return -5;
			})
			.text(function(d){
				return "LIV"
			})


			// .attr("dy",function(team){
			// 	return team=="EN"?15:-5;
			// })
			// .text(function(team){
			// 	return data[data.length-1].values[team]+" "+options.teams[team]
			// })

	function tickFormat(d){
		console.log("tickFormat",d)
    	return d3.time.format("%Y")(new Date(d));
    }

	var xAxis = d3.svg.axis()
				    .scale(xscale)
				    .orient("bottom")
					.tickValues(function(){

						var d1=data[0].dateObj,
							d2=data[data.length-1].dateObj,
							dates=[+d1,+d2];

						var years=d3.range((d2.getFullYear() - d1.getFullYear())/20-1).map(function(y){
							return (1882 - 1882%20)+(y+1)*20;
						})

						years.forEach(function(y){
							dates.push(new Date(y,0,1));
						})

						return dates;

					}())
				    .tickFormat(tickFormat)
				    

	var axis=axes.append("g")
			      .attr("class", "x axis")
			      .attr("transform", "translate("+0+"," + (yscale.range()[0]+3) + ")")
			      .call(xAxis);

	axis.append("rect")
			.attr("class","ww ww1")
			.attr("x",xscale(periods[0].values[periods[0].values.length-1].values.dateObj))
			.attr("width",function(){
				var x1=xscale(periods[0].values[periods[0].values.length-1].values.dateObj),
					x2=xscale(periods[1].values[0].values.dateObj);
				return x2-x1;
			})
			.attr("y",-yscale.range()[0])
			.attr("height",yscale.range()[0])
			.style({
				fill:"url(#diagonalHatch)"
			})

	axis.append("text")
			.attr("class","ww ww1")
			.attr("x",xscale(periods[0].values[periods[0].values.length-1].values.dateObj))
			.attr("y",0)
			.attr("dx",2)
			.attr("dy",-2)
			.text("WW1")

	axis.append("rect")
			.attr("class","ww ww2")
			.attr("x",xscale(periods[1].values[periods[1].values.length-1].values.dateObj))
			.attr("width",function(){
				var x1=xscale(periods[1].values[periods[1].values.length-1].values.dateObj),
					x2=xscale(periods[2].values[0].values.dateObj);
				return x2-x1;
			})
			.attr("y",-yscale.range()[0])
			.attr("height",yscale.range()[0])
			.style({
				fill:"url(#diagonalHatch)"
			})

	axis.append("text")
			.attr("class","ww ww2")
			.attr("x",xscale(periods[1].values[periods[1].values.length-1].values.dateObj))
			.attr("y",0)
			.attr("dx",2)
			.attr("dy",-2)
			.text("WW2")

	this.update=update;

	function update() {
		var size=viz.node().getBoundingClientRect(),
    		WIDTH = size.width;

    	xscale.range([0,WIDTH-(margins.left+margins.right)]);

    	notes.attr("transform",function(d){
						var x=Math.round(xscale(d.values.dateObj)),
							y=yscale(Math.max(d.values.attendanceNum))
						return "translate("+x+","+(y-40)+")";
				});

    	period.select("path")
				.attr("d",function(p){
					//console.log(p);
					
					return line(p.period.map(function(d){
						return {
							date:d.values.dateObj,
							customVals:d.values.attendanceNum
						}
					}))
				});

		teams.select("text.status")
				.attr("x",function(d){
					return xscale(data[data.length-1].values.dateObj)
				})
				.attr("y",function(team){
					return yscale(data[data.length-1].values.attendanceNum)
				});

		axis.call(xAxis);

		axis.select("rect.ww1")
				.attr("x",xscale(periods[0].values[periods[0].values.length-1].values.dateObj))
				.attr("width",function(){
					var x1=xscale(periods[0].values[periods[0].values.length-1].values.dateObj),
						x2=xscale(periods[1].values[0].values.dateObj);
					return x2-x1;
				})

		axis.select("text.ww1")
				.attr("x",xscale(periods[0].values[periods[0].values.length-1].values.dateObj));

		axis.select("rect.ww2")
				.attr("x",xscale(periods[1].values[periods[1].values.length-1].values.dateObj))
				.attr("width",function(){
					var x1=xscale(periods[1].values[periods[1].values.length-1].values.dateObj),
						x2=xscale(periods[2].values[0].values.dateObj);
					return x2-x1;
				});
				

		axis.select("text.ww2")
				.attr("x",xscale(periods[1].values[periods[1].values.length-1].values.dateObj));
				
	}

	/*
		  __________  ____  __  ______________ 
		 /_  __/ __ \/ __ \/ / /_  __/  _/ __ \
		  / / / / / / / / / /   / /  / // /_/ /
		 / / / /_/ / /_/ / /___/ / _/ // ____/ 
		/_/  \____/\____/_____/_/ /___/_/      
		                                       
	*/



	function Tooltip(options) {

		var w=options.width || 200,
			h=options.height || 110;

		////////console.log("!!!!!!!!!!!",options)

		var tooltip=d3.select(options.container)
						.append("div")
							.attr("class","tooltip")

		var series_status=tooltip.append("p").attr("class","status"),
			date=tooltip.append("span").attr("class","date"),
			location=tooltip.append("span").attr("class","date"),
			result=tooltip.append("h1");

		this.hide=function() {
			tooltip.classed("visible",false);
		}
		this.show=function(series,x,y,status) {

			var d=series;
			
			var w=(series.Winner==series.Team)?series.Won:series.Lost,
				l=(series.Winner==series.Team)?series.Lost:series.Won,
				winner=series.Winner;

			if(winner=="drawn"){

			} else if(winner=="ongoing") {
				winner="in progress "+w+" - "+l;
			} else {				
				winner=options.teams[series.Winner]+" won "+w+" - "+l;
			}

			//console.log(status)

			if(status) {
				series_status.html("<b class=\"LIV\">"+status.values["LIV"]+"</b> - <b class=\"EVE\">"+status.values["EVE"]+"</b>")	
			} else {
				series_status.html("&nbsp;")
			}
			
			date.text(series.Year.replace("/"," - "))
			location.text("Tour of "+options.teams[d.tour[0]]+" in "+options.teams[d.tour[1]])
			result.text(winner);

			//console.log(x-10)

			if(x+160 > WIDTH - margins.right) {
				x-= 190;// + options.margins.right + 20*2);
			}

			tooltip.style({
				left:(x+10+options.margins.left)+"px",
				bottom:(options.margins.bottom)+"px"
			})
			.classed("visible",true)
			
		}

	}
}




function getPeriods(timeData) {
	
	var ww1StartDate=new Date(1915,0,1),
		ww1EndDate=new Date(1918,11,31),
		ww2StartDate=new Date(1942,0,1),
		ww2EndDate=new Date(1945,11,31);

	var periods=d3.nest()
				.key(function(d){
					
					if(+d.dateObj < +ww1StartDate) {
						return "beforeWW1";
					}
					if(+d.dateObj > +ww2EndDate) {
						return "afterWW2";
					}
					if(+d.dateObj >= +ww1EndDate && +d.dateObj <= +ww2StartDate) {
						return "betweenWars";
					}
				})
				.entries(timeData);
		periods.forEach(function(p){
		p.values=p.values.sort(function(a,b){
			
			return +a.dateObj - +b.dateObj;
		})
	})

	return periods;
}


function addPattern(svg){
	var defs=svg.append("defs");

	var pattern=defs.append("pattern")
				.attr({
					id:"diagonalHatch",
					width:4,
					height:4,
					patternTransform:"rotate(45 0 0)",
					patternUnits:"userSpaceOnUse"
				});
	
	pattern
		.append("line")
		.attr({
			x0:0,
			y1:0,
			x2:0,
			y2:5
		})
		.style({
			stroke:"#000",
			"stroke-opacity":0.2,
			"stroke-width":1
		});
}

module.exports=LineChart;