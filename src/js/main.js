import reqwest from 'reqwest'
import _ from 'lodash'
import d3 from './lib/d3.min_04_30_15.js'

import mainHTML from './text/main.html!text'
import results from  '../assets/data/results.json!json';
import topScorers from  '../assets/data/scorers.json!json';
import share from './lib/share'
import LineChart from './football/LineChart';

import { getDecade, getMonthNum, getDayNum, getSeason } from './lib/dateCustom'


var shareFn = share('Interactive title', 'http://gu.com/p/URL', '#Interactive');
var results_data, goals_data, pens_data, cards_data, series_data;
var LiverpoolCardsR = 0, EvertonCardsR = 0, LiverpoolPensR = 0, EvertonPensR = 0;
var date_format = d3.time.format("%d %b %Y");



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

    var rawData = results.sheets.results;
    var penCountLiv = 0, cardCountLiv = 0, penCountEve = 0, cardCountEve = 0; 

    results_data = series_data = [];



        _.each(rawData, function(o){
            var newObj = modelObj(o);
            results_data.push(newObj);
        })


    goals_data = tallyScorers(results_data);
    pens_data = tallyPens(results_data);
    cards_data = tallyCards(results_data);

    _.each(cards_data, function(o){
       console.log(o)
    })

    series_data.forEach(function(results_data,i){
            if(series_data[i+1]) {
                results_data.nextdate=series_data[i+1].date;
            };
        })

    

    var linechart=new LineChart(cards_data,{
            series:series_data,
            container:"#timeline",
            teams:{
                    "LIV":"Liverpool",
                    "EVE":"Everton"
                }
        });

    

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

        //if (o.Venue !=  "Anfield" && o.Venue != "Goodison Park") { handleNeutral(o) }  

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
                    tObj.player = scorer
                    tObj.goalTo = "Liverpool"
                    tObj.values = o
                    t.push(tObj)
                 })

                 _.each(eArr, function(scorer){
                    var tObj = {}               
                    tObj.player = scorer
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
                //var penCount
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





// Attendance:"44,450"
// Competition:"13–14 Premier League"
// Date:"28/01/2014"
// Everton_Red_cards:""
// Everton_Scorers:""
// Liverpool_Red_cards:""
// Liverpool_Scorers:"Gerrard,   Sturridge (2),  Suárez"
// Score:"4–0"
// Venue:"Anfield"
