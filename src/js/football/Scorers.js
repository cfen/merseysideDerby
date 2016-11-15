

function Scorers(data) {

	var seasons=d3.nest()
		// .key(function(d){
		// 	return d.scorer;
		// })
		.key(function(d){
			return d.season;
		}).entries(data.goals);

	return(seasons)

}



module.exports = Scorers;


//taken from line 15
// var players;

// 	function setExtents() {

// 		extents={
// 			x:[0,d3.max(seasons,function(d){
// 				return d;
// 			})],
// 			mean_x:[0,d3.max(seasons,function(d){
// 				return 1;
// 			})],
// 			y:d3.extent(seasons,function(d){
// 				return +d.key;
// 			}),
// 			runs:d3.extent(data,function(d){
				
// 				return d.goals;
// 			}),
			
// 			date:d3.extent(data,function(d){
// 				console.log(d)
// 				return d.goalsData[d.goalsData.length-1].values.date;
// 			}),
// 			aindex:d3.extent(data,function(d,i){
// 				return i;
// 			})
// 		};

// console.log(extents)	
// 		players=d3.nest()
// 			.key(function(d){
// 				console.log(d)
// 				return d.key;
// 			})
// 			.rollup(function(leaves){
// 				return {
// 					y:d3.extent(seasons,function(d){
// 						return +d.key;
// 					}),
// 					min_date: d3.min(leaves,function(d){
// 						return +d.date;
// 					}),
// 					max_date: d3.max(leaves,function(d){
// 						return +d.date;
// 					}),
// 					y_gap:(function(){
// 						var year_ext=d3.extent(leaves,function(d){

// 							//console.log(d)
// 							return +d.goalsData[0].values.dateObj.getFullYear();
// 						});
// 						return year_ext[1]-year_ext[0]
// 					}()),
// 					n_matches:leaves.length
// 				}
// 			})
// 			.entries(data);

// 		extents.y_gap=d3.max(players,function(d){
// 			return d.values.y_gap;
// 		});
// 		extents.n_matches=[0,d3.max(players,function(d){
// 			return d.values.n_matches;
// 		})];
// 	};

// 	setExtents();

// 	var charts=[];

// 	players
// 		.filter(function(d){
// 			return 1;
// 			return d.key == "cook"
// 			return d.key=="sachin";
// 			return d.key !='bradman' && d.key != 'hobbs';
// 			return d.key == "waugh"// || d.key == "hobbs"
// 		})
// 		.filter(function(d){
// 			console.log(d);
// 			var player=options.players.find(function(player){

// 				//console.log(player.id,d.key)
// 				return player.id==d.key;
// 			});
// 			//console.log("FOUND",player,d)
// 			return +player.dates[1] >= + options.from && +player.dates[0] <= + options.to
// 		})
// 		.sort(function(a,b) {
// 			return (+b.values.max_date - +a.values.max_date)
// 		})
// 		.forEach(function(player){

// 			console.log("PLAYER",player.key,player)

// 			charts.push(
// 				new CareerChart(data.filter(function(d){
// 					return d.Player == player.key
// 				}),{
// 						container:options.container,
// 						name:player.key,
// 						extents:extents,
// 						indexed:true,
// 						only_ashes:true,
// 						type:"area",
// 						info: options.players.find(function(d){
// 							return d.id==player.key;
// 						}),
// 						teams:options.teams,
// 						aggregates:d3.nest()
// 										.key(function(d){
// 											return d.Year;
// 										})
// 										.entries(options.aggregates)
// 					}
// 				)
// 			);
			
// 		});

// 		this.update=function() {
// 			charts.forEach(function(chart){
// 				chart.update();
// 			})
// 		};

// 		d3.select("#theBestBatsmen")
// 			.select("h2")
// 			.on("click",function(){
// 				charts.forEach(function(chart){
// 					chart.switchStatus();
// 				})
// 			})
