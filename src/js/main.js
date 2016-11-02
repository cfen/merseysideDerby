import reqwest from 'reqwest'
import _ from 'underscore'
import mainHTML from './text/main.html!text'
import results from  '../assets/data/results.json!json';
import share from './lib/share'

import { getDecade, getMonthNum, getDayNum, getSeason } from './lib/dateCustom'

var shareFn = share('Interactive title', 'http://gu.com/p/URL', '#Interactive');
var resultsData;


export function init(el, context, config, mediator) {
    el.innerHTML = mainHTML.replace(/%assetPath%/g, config.assetPath);

    reqwest({
        url: 'http://ip.jsontest.com/',
        type: 'json',
        crossOrigin: true,
        success: (resp) => initData()
    });

    [].slice.apply(el.querySelectorAll('.interactive-share')).forEach(shareEl => {
        var network = shareEl.getAttribute('data-network');
        shareEl.addEventListener('click',() => shareFn(network));
    });
}

function initData(){
    var rawData = results.sheets.results;
    resultsData = [];

        _.each(rawData, function(o){
            var newObj = modelObj(o)

            resultsData.push(newObj)
        })

    console.log(resultsData)
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
        //t.score = o.Score;
        t.Venue = o.Venue;
        
        t.year = o.Date.split("/")[2];
        t.sortDate = o.Date.split("/")[2]+o.Date.split("/")[1]+o.Date.split("/")[0];
        t.season = getSeason(o.Date,"/");  

        t.homeScorers = tally(t,"H","goals");
        t.awayScorers = tally(t,"A","goals");

        t.homeRedCards = tally(t,"H","cards");
        t.awayRedCards = tally(t,"A","cards");
  

    return t;

}

function getHomeTeam(o, score){
    var s ="neutral";

        if (o.Venue == "Goodison Park") { s = "Everton" }
        if (o.Venue == "Anfield") { s = "Liverpool" }
        if (o.Venue != "Anfield" && o.Venue != "Goodison Park") { s = checkNeutralGround(o, score) }

    return s;
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

        if (o.hometeam == "Liverpool" && s == "H" && v == "goals"){ arr = tallyArray( o.Liverpool_Scorers) }
        if (o.hometeam == "Everton" && s == "H" && v == "goals"){ arr = tallyArray( o.Everton_Scorers ) }
        if (o.hometeam == "Liverpool" && s == "A" && v == "goals"){ arr = tallyArray( o.Everton_Scorers ) }
        if (o.hometeam == "Everton" && s == "A" && v == "goals"){ arr = tallyArray( o.Liverpool_Scorers ) }

        if (o.hometeam == "Liverpool" && s == "H" && v == "cards"){ arr = tallyArray( o.Liverpool_Red_cards) }
        if (o.hometeam == "Everton" && s == "H" && v == "cards"){ arr = tallyArray( o.Everton_Red_cards ) }
        if (o.hometeam == "Liverpool" && s == "A" && v == "cards"){ arr = tallyArray( o.Everton_Red_cards ) }
        if (o.hometeam == "Everton" && s == "A" && v == "cards"){ arr = tallyArray( o.Liverpool_Red_cards ) } 

        

    return arr

}

function tallyArray( o ){
    var a = o.split(",");
    var arr = [ ];

    _.each(a, function(str){
        str = str.trim();
        if (str.includes('(2 pens.)')) { var newStr = str.split(" ")[0]+"(pen.)"; newStr = newStr.trim(); arr.push(newStr); arr.push(newStr);}
        if (str.includes('(2)')) { var newStr = str.split(" ")[0]; newStr = newStr.trim(); arr.push(newStr); arr.push(newStr);};
        if (str.includes('(3)')) { var newStr = str.split(" ")[0]; newStr = newStr.trim(); arr.push(newStr); arr.push(newStr); arr.push(newStr);};
        if (str.includes('(4)')) { var newStr = str.split(" ")[0]; newStr = newStr.trim(); arr.push(newStr); arr.push(newStr); arr.push(newStr); arr.push(newStr); };
        if (!str.includes('(2)') && !str.includes('(2 pens.)') && !str.includes('(3)')  && !str.includes('(4)') && str != '') { arr.push(str) }
    })

    return arr
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
