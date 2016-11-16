import reqwest from 'reqwest'
import _ from 'lodash'
import d3 from './lib/d3.min_04_30_15.js'

import mainHTML from './text/main.html!text'
import results from  '../assets/data/results.json!json'
import Players from  '../assets/data/players.json!json'
import dataUtils from './utils/data';


import share from './lib/share'
import LineChart from './football/LineChart'
import Scorers from './football/Scorers'
import CareerChart from './football/ScorersCareerChart'
import { getDecade, getMonthNum, getDayNum, getSeason } from './lib/dateCustom'


var grid={
    row_height: 36,
    column_width: 60,
    gutter: 12,
    margin: 20
};


var shareFn = share('Interactive title', 'http://gu.com/p/URL', '#Interactive');
var results_data, goals_data, pens_data, cards_data, series_data;
var LiverpoolCardsR = 0, EvertonCardsR = 0, LiverpoolPensR = 0, EvertonPensR = 0; 

var date_format = d3.time.format("%d %b %Y");

var prev_date={
    scorers:null
};

var players = Players;


export function init(el, context, config, mediator) {
    el.innerHTML = mainHTML.replace(/%assetPath%/g, config.assetPath);

        reqwest({
            url: 'http://ip.jsontest.com/',
            type: 'json',
            crossOrigin: true,
            success: (resp) => initData()
        });

    // [].slice.apply(el.querySelectorAll('.interactive-share')).forEach(shareEl => {
    //     var network = shareEl.getAttribute('data-network');
    //     shareEl.addEventListener('click',() => shareFn(network));
    // });
}

function initData(){

    var rawData = results.sheets.results.reverse();

    results_data = series_data = [];

        _.each(rawData, function(o){
            var newObj = modelObj(o);
            results_data.push(newObj);
        })


    goals_data = tallyScorers(results_data);
    pens_data = tallyPens(results_data);
    cards_data = tallyCards(results_data);


    _.each(goals_data, function(o){
       o.player = o.player.split(" ");      
       o.scorer = o.player[0];
    })

    var goalsQty = _.groupBy(goals_data, 'scorer'); 
    var scorers_data = []
    
        _.each(goalsQty, function(a,k){

        if(a.length > 6){ 
                var scorer = {}
                scorer.key = k;
                scorer.player = k;
                scorer.goals = a.length;
                scorer.goalsData = a;
                scorer.scoringMatches = _.uniqBy(a, "date");
                scorer.dateStart = getSeasonExtent("start", a[0].values.season);
                scorer.dateEnd = getSeasonExtent("end", a[a.length-1].values.season);
                //a.goalTo == "Everton" ? scorer.teamGoals = a.values.EvertonGoalsN : scorer.teamGoals = a.values.LiverpoolGoalsN; //scorer.teamGoals = 
                scorers_data.push(scorer); 
            }
        })

    series_data.forEach(function(results_data,i){
        LiverpoolCardsR+=series_data[i].LiverpoolRedCardsN;
        EvertonCardsR+= series_data[i].EvertonRedCardsN;
        // LiverpoolPensR+=
        // EvertonPensR+=
            //console.log(i,series_data[i].date)
            if(series_data[i+1]) {
                results_data.nextdate=series_data[i+1].date;
            };
        })


    let linechart_cards=new LineChart(cards_data,{
            series:series_data,
            container:"#timelineCards",
            teams:{
                    "LIV":"Liverpool",
                    "EVE":"Everton"
                }
        });
    
    // let scorers = new Scorers(scorers_data,{
    //             series:series_data,
    //             container:"#timelineScorers",
    //             teams:{
    //                     "LIV":"Liverpool",
    //                     "EVE":"Everton"
    //                 }
    //         });

   

    players=dataUtils.updatePlayers(players,scorers_data,cards_data); // add redcards and pens here -- batsmen_data,bowlers_data

    modelPlayerChartsData(players)

    // let linechart_pens=new LineChart(cards_data,{
    //         series:series_data,
    //         container:"#timelinePens",
    //         teams:{
    //                 "LIV":"Liverpool",
    //                 "EVE":"Everton"
    //             }
    //     });


}

function getSeasonExtent(s,season){
    var years=season.split("–");
    return s =='start' ? new Date(Number(years[0]),6,14) :  new Date(Number(years[1]),6,15) ;
}


function modelObj(o){

    var t = o // t for temp object

        if (o.Score.includes('(aet)')) { 
            t.notes = "(aet)" ; 
            t.score = o.Score.split(" ")[0]; 
        };
        if (!o.Score.includes('(aet)')) { 
            t.score = o.Score;
        };

        t.hometeam = getHomeTeam(o, t.score);
        t.awayteam = getAwayTeam(t.hometeam);
        //t.score = o.Score;
        t.Venue = o.Venue;
        
        t.year = Number(o.Date.split("/")[2]);
        t.month = Number(o.Date.split("/")[1])-1;
        t.day = Number(o.Date.split("/")[0]);
        t.dateObj = new Date(t.year,t.month,t.day);

        t.date = date_format(t.dateObj);

        t.sortDate = Number(o.Date.split("/")[2]+o.Date.split("/")[1]+o.Date.split("/")[0]);
        t.season = getSeason(o.Date,"/");  

        t.liverpoolScorers = tally(t,"Liverpool","goals");
        t.evertonScorers = tally(t,"Everton","goals");

        t.liverpoolRedCards = tally(t,"Liverpool","cards");
        t.evertonRedCards = tally(t,"Everton","cards");

        t.LiverpoolGoalsN = t.liverpoolScorers.length;
        t.EvertonGoalsN = t.evertonScorers.length;

        t.LiverpoolRedCardsN = t.liverpoolRedCards.length;
        t.EvertonRedCardsN = t.evertonRedCards.length;

        LiverpoolCardsR += t.LiverpoolRedCardsN; 
        EvertonCardsR += t.EvertonRedCardsN;
        // LiverpoolPensR += t.LiverpoolPensN; 
        // EvertonPensR += t.EvertonPensN;

        t.LiverpoolCardsR = LiverpoolCardsR;
        t.EvertonCardsR = EvertonCardsR;
        // t.LiverpoolPensR = LiverpoolPensR;
        // t.EvertonPensR = EvertonPensR;

        t.attendanceNum = Number(o.Attendance.split(",").join(""));
        
        //console.log( t.date, t.LiverpoolCardsR )

    return t;

}

function getHomeTeam(o, score){
    var s ="neutral";

        if (o.Venue == "Goodison Park") { s = "Everton" }
        if (o.Venue == "Anfield") { s = "Liverpool" }
        if (o.Venue != "Anfield" && o.Venue != "Goodison Park") { s = checkNeutralGround(o, score) }

    return s;
}

function getAwayTeam(s){
    var op;
    s == "Liverpool" ? op = "Everton" : op = "Liverpool";
    return op;
}

function checkNeutralGround(o, score){
    var s;
    var arrLiverpool = tallyArray(o.Liverpool_Scorers);
    var scoreArr = score.split("–")

    var homeScore = Number(scoreArr[0])

        arrLiverpool.length == homeScore ? s = "Liverpool" : s = "Everton";

    return s;
}



function tally(o,s,v){

    var arr;

        if (o.hometeam == "Liverpool" && s == "Liverpool" && v == "goals"){ arr = tallyArray( o.Liverpool_Scorers) }
        if (o.awayteam == "Liverpool" && s == "Liverpool" && v == "goals"){ arr = tallyArray( o.Liverpool_Scorers ) }
        if (o.hometeam == "Everton" && s == "Everton" && v == "goals"){ arr = tallyArray( o.Everton_Scorers ) }
        if (o.awayteam == "Everton" && s == "Everton" && v == "goals"){ arr = tallyArray( o.Everton_Scorers ) }

        if (o.hometeam == "Liverpool" && s == "Liverpool" && v == "cards"){ arr = tallyArray( o.Liverpool_Red_cards) }
        if (o.awayteam == "Liverpool" && s == "Liverpool" && v == "cards"){ arr = tallyArray( o.Liverpool_Red_cards ) }
        if (o.hometeam == "Everton" && s == "Everton" && v == "cards"){ arr = tallyArray( o.Everton_Red_cards ) }
        if (o.awayteam == "Everton" && s == "Everton" && v == "cards"){ arr = tallyArray( o.Everton_Red_cards ) } 

    return arr

}

function tallyArray( s ){
    var a = s.split(",");
    var arr = [ ];

        _.each(a, function(str){
            str = str.trim();
            if (str.includes('(2 pens.)')) { var newStr = str.split(" ")[0]+" (pen.)"; newStr = newStr.trim(); arr.push(newStr); arr.push(newStr); }
            if (str.includes('(2 - 1 pen.)')) { var newStr = str.split(" ")[0]; newStr = newStr.trim(); arr.push(newStr+" (pen.)"); arr.push(newStr); }
            if (str.includes('(2)')) { var newStr = str.split(" ")[0]; newStr = newStr.trim(); arr.push(newStr); arr.push(newStr); }
            if (str.includes('(3)')) { var newStr = str.split(" ")[0]; newStr = newStr.trim(); arr.push(newStr); arr.push(newStr); arr.push(newStr); }
            if (str.includes('(4)')) { var newStr = str.split(" ")[0]; newStr = newStr.trim(); arr.push(newStr); arr.push(newStr); arr.push(newStr); arr.push(newStr); }
            if (!str.includes('(2)') && !str.includes('(2 pens.)') && !str.includes('(3)')  && !str.includes('(4)') && str != '') { arr.push(str); }
        })

    return arr

}


function tallyScorers(a){
    var t = [];

        _.each(a, function(o){
             var lArr = tallyArray(o.Liverpool_Scorers);
             var eArr = tallyArray(o.Everton_Scorers); 

                 _.each(lArr, function(scorer){

                    var tObj = {}  
                    tObj.date = o.date          
                    tObj.player = scorer
                    tObj.season = o.season
                    tObj.goalTo = "Liverpool"
                    tObj.values = o
                    t.push(tObj)
                 })

                 _.each(eArr, function(scorer){
                    var tObj = {}    
                    tObj.date = o.date              
                    tObj.player = scorer
                    tObj.season = o.season                    
                    tObj.goalTo = "Everton"
                    tObj.values = o
                    t.push(tObj)                  
                 })

        } )

   return t     

}

function tallyPens(a){
    var t = [];

        _.each(a, function(o){
             var lArr = tallyArray(o.Liverpool_Scorers);
             var eArr = tallyArray(o.Everton_Scorers);           
       
                 _.each(lArr, function(scorer){
                    if (scorer.includes('(pen.)')){ 
                        var tObj = {} 
                        tObj.player = scorer.split(" ")[0];
                        tObj.penaltyTo = "Liverpool";
                        tObj.date  = o.date;
                        tObj.values = o;
                        t.push(tObj) 
                    }

                 })

                 _.each(eArr, function(scorer){
                    
                    if (scorer.includes('(pen.)')){ 
                            var tObj = {} 
                            tObj.player = scorer.split(" ")[0];
                            tObj.penaltyTo = "Everton"; 
                            tObj.date  = o.date;
                            tObj.values = o;
                            t.push(tObj)  
                        }
                 })

        } )

        _.each(t, function(o){
            console.log("WORK HERE -"+o)
        })

   return t     

}


function tallyCards(a){
    var t = [];

        _.each(a, function(o){
             var lArr = tallyArray(o.Liverpool_Red_cards);
             var eArr = tallyArray(o.Everton_Red_cards);           

                 _.each(lArr, function(player){
                    var tObj = {} 
                    tObj.player = player;
                    tObj.cardTo = "Liverpool"; 
                    tObj.values = o;
                    t.push(tObj) 
                 })

                 _.each(eArr, function(player){
                    var tObj = {} 
                    tObj.player = player;
                    tObj.cardTo = "Everton"; 
                    tObj.values = o;
                    t.push(tObj) 
                 })

        } )

   return t;  

}


function modelPlayerChartsData(players){

    let a = players.scorers;

    var scorers=[];

    _.each(a, function (o){
            var scorer = new Scorers(o)
            scorers.push(scorer)

    });

    _.each(scorers, function(a){
        
        _.each(a, function(o,k){

            o.startDate = getSeasonExtent("start", o.key)
            o.endDate = getSeasonExtent("end", o.key)
            o.player = o.values[0].scorer
            o.team = o.values[0].goalTo

                _.each(o.values, function(obj){
                    console.log(obj)
                    obj.dateObj = obj.values.dateObj
                    obj.teamGoals = o.team == "Liverpool" ? obj.values.LiverpoolGoalsN : obj.values.EvertonGoalsN
                    obj.oppoGoals = o.team == "Everton" ? obj.values.LiverpoolGoalsN : obj.values.EvertonGoalsN  
                })
             
            
        })
    })

    
    addPlayerCharts(scorers)

}

function addPlayerCharts(a){
    var options = { height: (grid.row_height * 2), width: ( grid.column_width*2 ), margin: grid.margin, gutter: grid.gutter,  maxGoals: 6 , container: "#scorers"}

    _.each(a, function(o){
        var smallMultiple = new CareerChart(o,options,players)
      
    })




}






//new CareerChart(a.filter(function(d){
//                  return d.Player == player.key
//              }),{
//                      container:options.container,
//                      name:player.key,
//                      extents:extents,
//                      indexed:true,
//                      only_ashes:true,
//                      type:"area",
//                      info: options.players.find(function(d){
//                          return d.id==player.key;
//                      }),
//                      teams:options.teams,
//                      aggregates:d3.nest()
//                                      .key(function(d){
//                                          return d.Year;
//                                      })
//                                      .entries(options.aggregates)
//                  }
//              )
//          );
            






// Attendance:"44,450"
// Competition:"13–14 Premier League"
// Date:"28/01/2014"
// Everton_Red_cards:""
// Everton_Scorers:""
// Liverpool_Red_cards:""
// Liverpool_Scorers:"Gerrard,   Sturridge (2),  Suárez"
// Score:"4–0"
// Venue:"Anfield"
