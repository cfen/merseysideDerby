var date_format = d3.time.format("%d %b %Y");


function ScorersCareerChart(data,options) {

	var margins={ top:1, right:0, bottom:0, left: 1 }
	var xscale, yscale;
	var newChart = d3.select(options.container).append("div").attr("class","small-multiple-holder")


	for (var i=0; i < data.length; i++){
		var d = data[i]
	
		var d3StartDate = date_format(d.startDate);
		var d3EndDate = date_format(d.endDate);

		var startObj = { teamGoals: 0 , date: d3StartDate }
		var endObj = { teamGoals: 0 , date: d3EndDate }

		var lineData = getLineData(startObj, endObj, d)
		
		var x = d3.time.scale().domain([d3StartDate,d3EndDate]).range([0, options.width]);
		var y = d3.scale.linear().domain([0, options.maxGoals]).range([options.height, 0]);

		var xscale=d3.scale.linear().domain([d3StartDate,d3EndDate]).rangeRound([0,options.width-(margins.left+margins.right)]),
		yscale=d3.scale.linear().domain([0, options.maxGoals]).range([options.height-(margins.top+margins.bottom),0]).nice();

		var valueline = d3.svg.line()
		    .x(function(d) { return x(d.date); })
		    .y(function(d) { return y(d.teamGoals); });

		// xscale.domain(d3Date);
		// yscale.domain(options.maxGoals);
		// xscale.range([0,options.width-(margins.left+margins.right)]);
		// yscale.range([0,options.height-(margins.top+margins.bottom)]);

		var valueline = d3.svg.line()
		    .x(function(d) { return x(d.date); })
		    .y(function(d) { return y(d.teamGoals); });

		var newSmallChart = newChart.append("div")
			.attr("class","small-multiple")
			.attr("id", function(d){ return "sm_"+data[i].key})
			.style("height", options.height+"px")
			.style("width", options.width+"px")
			.style("background-color","#EEE")

		var svg = newSmallChart.append("svg")
			.attr("width","100%")
			.attr("height","100%")	

		career_g=svg.append("g")
					.attr("class","career")
					.attr("transform","translate("+(margins.left)+","+margins.top+")"),

		career_g.append("path")
        .attr("class", "line")
        .attr("d", valueline(lineData));
						
		axes=svg.append("g")
			.attr("class","axes")
			.attr("transform","translate("+(margins.left)+","+margins.top+")")	




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
			// 		tooltip.show(match,xscale(match[INDEX]),yscale.range()[0]);
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
	startObj.scorer = endObj.scorer = dataIn.values[0].scorer
	startObj.oppoGoals = endObj.oppoGoals = 0
	startObj.teamGoals = endObj.teamGoals = 0

	tempArr.push (startObj);

	for (var i=0; i< dataIn.values.length; i++){

		tempArr.push(dataIn.values[i])
	}

	tempArr.push (startObj);

	console.log(tempArr)

	return tempArr;
}

}



module.exports = ScorersCareerChart;
