var date_format = d3.time.format("%d %b %Y");
var circleCount = 0;

function ScorersCareerChart(dataIn,options,players) {

	var extraData = players.scorers;

	var extraDataObject;



	var margins={ top:0, right:0, bottom:12, left: 1 }
	var padding= 2;
	var xscale, yScale;
	var newChart = d3.select(options.container).append("div").attr("class","small-multiple-holder")
	var cRadius = 2.5;
	//var goalsData = dataIn.values

	for (var i=0; i < dataIn.length; i++){

		var data = dataIn[i]
		
		var d3StartDate = date_format(data.startDate);
		var d3EndDate = date_format(data.endDate);


		var startObj = { teamGoals: 0 , dateObj: data.startDate }
		var endObj = { teamGoals: 0 , dateObj: data.endDate }

		var lineData = getLineData(startObj, endObj, data.values)

		
		 var mindate = new Date(2012,0,1),
            maxdate = new Date(2012,0,31); 
            
        var xScale = d3.time.scale().domain([data.startDate , data.endDate]).range([0, options.width]); 		

		var yScale=d3.scale.linear().domain([0, options.maxGoals]).range([options.height-(margins.top+margins.bottom),0]).nice();
	
		var yAxisScale = d3.scale.linear().domain([0, options.maxGoals]).range([options.height-(margins.top+margins.bottom),0]);

		var valueline = d3.svg.line()
		    .x(function(d) { return xScale(d.dateObj); })
		    .y(function(d) { return yScale(d.teamGoals); });

		// xscale.domain(d3Date);
		// yScale.domain(options.maxGoals);
		// xscale.range([0,options.width-(margins.left+margins.right)]);
		// yScale.range([0,options.height-(margins.top+margins.bottom)]);

		var xAxis = d3.svg.axis().scale(xScale);

        var yAxis = d3.svg.axis()
                  .scale(yScale)
                  .orient("right")
                  .tickSize(options.width+1) //function(d,i) { return i%2 ? 5 : 2;}
                  .ticks(options.maxGoals-1);          

		var newSmallChart = newChart.append("div")
			.attr("class","small-multiple")
			.attr("id", function(d){ return "sm_"+data.key})
			.style("height", options.height+"px")
			.style("width", options.width+"px")

		var svg = newSmallChart.append("svg")
			.attr("width","100%")
			.attr("height",options.height + margins.bottom)	

		career_g=svg.append("g")
					.attr("class","career")
					.attr("transform","translate("+(margins.left)+","+margins.top+")"),
		

		career_g.append("path")
	        .attr("class", function(d){ return "line "+data.team } )
	        .attr("d", valueline(lineData));

	    axes=career_g.append("g")
			.attr("class","axes")
			.attr("transform","translate(-2, -1)").call(yAxis)



		career_g.selectAll("circle").data(data.values).enter()
			  .append("circle")
			  .attr("r", function(d,i) {return cRadius;})
			  .attr("cx",function(d,i) {return xScale(d.dateObj);})
			  .attr("cy",function(d,i) { 
			  		
			  		for(var k = 0; k<d.teamGoals; k++){
			  			return yScale(k)-(cRadius/2)
			  		}

			  	// 	if (data.values[i-1]) {
			  	// 		console.log(d.teamGoals)
			  	// 		d.dateObj == data.values[i-1].dateObj ? circleCount++ : circleCount = 0;
			  	// 		//console.log(d.dateObj, data.values[i-1].dateObj, circleCount)

			  	// 	}
			  	// return yScale(circleCount)-(cRadius/2);
			  })
			  ;

		svg.append("text")
			.attr("class","sm-caption")
			.text(function(d){  return data.values[0].season  }) 
			.attr("x", margins.left)
			.attr("y", options.height + padding)		

		






		// g.append("path")
		//       .datum(d)
		//       .attr("class", "line")
		//       .attr("d", line);

		



		// var goals = career_g.selectAll("g.inn")
		// 	.data(d.values)
		// 	.enter()
		// 	.append("g")
		// 		.attr("class",function(d){
		// 			return "inn "+d.Team;
		// 		});

		// ux.append("rect")
		// 	.attr("x",0)
		// 	.attr("y",0)
		// 	.attr("width",options.height+"px")
		// 	.attr("height",options.width+"px")
			// .on("mousemove",function(d){
			// 	var coord=d3.mouse(this);

			// 	var match=findBar(xscale.invert(coord[0]-margins.left))
			// 	if(match) {
			// 		tooltip.show(match,xscale(match[INDEX]),yScale.range()[0]);
			// 		highlightMatch(match);
			// 	}
				

			// })	
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
							//.style({
								//width:w+"px",
							//	height:h+"px"
							//});

		var title=tooltip.append("h1"),
			runs=tooltip.append("span").attr("class","runs"),
			bf=tooltip.append("span").attr("class","date"),
			sr=tooltip.append("span").attr("class","date"),
			//s4=tooltip.append("span").attr("class","date"),
			s6=tooltip.append("span").attr("class","date");

		this.hide=function() {
			tooltip.classed("visible",false);
		}
		this.show=function(match,x,y) {

			//////console.log(x,y,match)



			//title.text(match.runs+" runs "+match.Opposition);
			title.html(options.teams[options.info.country]+" - "+match.Opposition+"<span>"+(match.Venue+", "+match.date)+"</span>");
			
			runs.text("Runs scored: "+match.runs);
			bf.text("Ball faced: "+match.BF)
			sr.text("Batting Strike Rate: "+match.SR).style("display","block")
			if(!(+match.SR)) {
				sr.style("display","none")
			}
			
			s6.text("Boundary 4s: "+match["4s"]+" - 6s:"+match["6s"])
			//s4.text("Boundary 4s: "+match["4s"])

			if(x+w+options.margins.right > WIDTH) {
				x-= (w + options.margins.right + 20*2);
			}

			tooltip.style({
				left:(x+20+options.margins.left)+"px",
				//bottom:(y+options.margins.top)+"px"
				bottom:(options.margins.bottom)+"px"
			})
			.classed("visible",true)
			
			//ground.text(match.Ground);
			//runs.text(match.runs+" runs");
		}

	}

	function getLineData(startObj, endObj,  dataIn ){

		var tempArr = [];
			startObj.scorer = endObj.scorer = dataIn.scorer
			startObj.oppoGoals = endObj.oppoGoals = 0
			startObj.teamGoals = endObj.teamGoals = 0

		tempArr.push (startObj);

		for (var i=0; i< dataIn.length; i++){

				tempArr.push(dataIn[i])
		}

		tempArr.push (endObj);

		return tempArr;
	}

}



module.exports = ScorersCareerChart;
