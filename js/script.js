// GLOBAL

var letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

var Divs = [];
var Teams = {};
var NumTeam = 0;
var matchesDates = new Array(23);

var rankingDone = 0;

var Initilised = false;
// Function


function FirstInit() {
    //List Semaine

    for (var _int = 0; _int < 23; _int++) {
        var option = document.createElement("option");
        if (_int == 0) {
            option.text = "Actuelle";
        } else {
            option.text = "Semaine " + _int;
        }
        option.value = _int;
        document.getElementById("SelectWeek").add(option);

    }

    importTeams();
    
}

function Init() {

    // List Of Divisions
    for (var int = 0; int < Divs.length; int++) {
        var t = Teams[Divs[int]];
        var option = document.createElement("option");
        option.text = t.DivisionName + " - Presgaux " + t.Team;
        option.value = t.DivisionId;
        document.getElementById("SelectTeam").add(option);

    }

    var option = document.createElement("option");
    option.text = "Toutes";
    option.value = "All";
    document.getElementById("SelectTeam").add(option);


    hideLoader();
};

function importMatchesDates(teamLetter) {
    teamLetter = teamLetter || "A";

    var xml = '<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:tab="http://api.frenoy.net/TabTAPI">'
        + '<soapenv:Header/>'
        + '<soapenv:Body>'
        + '<tab:GetMatchesRequest>'
        + '<tab:Club>N115</tab:Club>'
        + '<tab:Team>' + teamLetter+'</tab:Team>'
        + '</tab:GetMatchesRequest>'
        + '</soapenv:Body>'
        + '</soapenv:Envelope>'


    soap(xml, setMatchesDates, importRankings);
    
}

function importTeams() {
    var xml = '<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:tab="http://api.frenoy.net/TabTAPI">'
            +   '<soapenv:Header/>'
            +   '<soapenv:Body>'
            +       '<tab:GetClubTeamsRequest>'
            +           '<tab:Club>N115</tab:Club>'
            +       '</tab:GetClubTeamsRequest>'
            +   '</soapenv:Body>'
            + '</soapenv:Envelope>'


    soap(xml, setTeams, importMatchesDates);
    //soap(xml, setTeams, Init);
}


function importRankings() {
    if (rankingDone < Divs.length) {
        // load rankings 1 by 1
        importRankingByDiv();    
    } else {
        if (!Initilised) {
            Init();
            Initilised = true;
        }        
        rankingDone = 0;
    }

}

function importRankingByDiv() {
    var divId = Teams[Divs[rankingDone]].DivisionId;
    var week = document.getElementById("SelectWeek").value;
    var weekParam = "";
    if (week != 0) {
        weekParam = '<tab:WeekName>' + week + '</tab:WeekName>';
    }

    var xml = '<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:tab="http://api.frenoy.net/TabTAPI">'
        + '<soapenv:Header/>'
        + '<soapenv:Body>'
        + '<tab:GetDivisionRankingRequest>'
        + '<tab:DivisionId>' + divId + '</tab:DivisionId>'
        + weekParam
        + '</tab:GetDivisionRankingRequest>'
        + '</soapenv:Body>'
        + '</soapenv:Envelope>'


    soap(xml, setRankingByDiv, importMatchesByDiv);
}
function importMatchesByDiv() {
    var divId = Teams[Divs[rankingDone]].DivisionId;
    var week = document.getElementById("SelectWeek").value;
    var weekParam = "";
    if (week == 0) {
        var now = new Date();
        for (var i = matchesDates.length - 1; i > 0; i--) {
            var md = new Date(matchesDates[i]);
            if (now > md) {
                week = i;
                i = 0;
            }
        }
        weekParam = '<tab:WeekName>' + week + '</tab:WeekName>';
    }

    var xml = '<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:tab="http://api.frenoy.net/TabTAPI">'
        + '<soapenv:Header/>'
        + '<soapenv:Body>'
        + '<tab:GetMatchesRequest>'
        + '<tab:DivisionId>' + divId + '</tab:DivisionId>'
        + weekParam
        + '</tab:GetMatchesRequest>'
        + '</soapenv:Body>'
        + '</soapenv:Envelope>'


    soap(xml, setMatchesByDiv, importRankings);
}


function activateLoader() {
    document.getElementById("downloadButton").disabled = true;
    document.getElementById("showButton").disabled = true;
    document.getElementById("loader").className = "loader loader-default is-active";
}

function hideLoader() {
    document.getElementById("downloadButton").disabled = false;
    document.getElementById("showButton").disabled = false;
    document.getElementById("loader").className = "loader loader-default";
}


//Function Utils

function soap(strRequest, callback, _afterCallback) {
    var xmlhttp = new XMLHttpRequest();

    //replace second argument with the path to your Secret Server webservices
    xmlhttp.open('POST', "https://api.vttl.be/0.7/index.php?s=vttl", true);


    //specify request headers
    xmlhttp.setRequestHeader('Content-Type', 'text/xml; charset=utf-8');
    //xmlhttp.setRequestHeader('SOAPAction', '"urn:thesecretserver.com/Authenticate"';);

    //FOR TESTING: display results in an alert box once the response is received
    xmlhttp.onreadystatechange = function () {
        if (xmlhttp.readyState == 4) {
            //alert(xmlhttp.responseText);
            callback(xmlhttp.responseText, _afterCallback);
        }
    };

    //send the SOAP request
    xmlhttp.send(strRequest);
};




// Callback Function



function setTeams(resp, callback) {
    var oParser = new DOMParser();
    var oDOM = oParser.parseFromString(resp, "application/xml");

    var teams = oDOM.firstElementChild.firstElementChild.firstElementChild.children;
    var nameSpace = teams[0].namespaceURI;

    for (i = 0; i< teams.length; i++) {

        if (teams[i].localName == "TeamCount") {
            NumTeam = parseInt(teams[i].innerHTML);
        } else if (teams[i].localName == "TeamEntries") {

            var Team = null;
            var TeamId = null;
            var DivisionId = null;
            var DivisionName = null;
            var DivisionCategory = null;
            var MatchType = null;


            for (var _i = 0; _i < teams[i].children.length; _i++) {
                switch (teams[i].children[_i].localName) {
                    case "TeamId":
                        TeamId = teams[i].children[_i].innerHTML;
                        break;
                    case "Team":
                        Team = teams[i].children[_i].innerHTML;
                        break;
                    case "DivisionId":
                        DivisionId = teams[i].children[_i].innerHTML;
                        break;
                    case "DivisionName":
                        DivisionName = teams[i].children[_i].innerHTML.split(" - ")[0].split(" ")[1];
                        break;
                    case "DivisionCategory":
                        DivisionCategory = teams[i].children[_i].innerHTML;
                        break;
                    case "MatchType":
                        MatchType = teams[i].children[_i].innerHTML;
                        break;
                }
            }

            Teams[Team] = {
                Team: Team,
                TeamId: TeamId,
                DivisionId: DivisionId,
                DivisionName: DivisionName,
                DivisionCategory: DivisionCategory,
                MatchType: MatchType
            };
            Divs.push(Team);

        }     

    }

    //NumTeam = NumberOfTeam;
    callback();
}

function setRankingByDiv(resp, callback) {
    var div = Teams[Divs[rankingDone]].DivisionName;
    var week = document.getElementById("SelectWeek").value;

    var classement = document.getElementById("exempleClassement").cloneNode(true);
    classement.id = div;
    document.getElementById("exempleClassement").parentNode.appendChild(classement);

    var node = document.getElementById(div);
    node.getElementsByClassName("ch_divName")[0].innerHTML = div;
    if (week != 0) {
        node.getElementsByClassName("ch_week")[0].innerHTML = " - Journée " + week;
    }

    //Parsing Response
    var oParser = new DOMParser();
    var oDOM = oParser.parseFromString(resp, "application/xml");

    var ranking = oDOM.firstElementChild.firstElementChild.firstElementChild.children;
    var nameSpace = ranking[0].namespaceURI;

    for (i = 0; i < ranking.length; i++) {

        if (ranking[i].localName == "RankingEntries") {

            var Position = null;
            var Team = null;
            var GamesPlayed = null;
            var GamesWon = null;
            var GamesLost = null;
            var GamesDraw = null;
            var IndividualMatchesWon = null;
            var IndividualMatchesLost = null;
            var IndividualSetsWon = null;
            var IndividualSetsLost = null;
            var Points = null;
            var TeamClub = null;


            for (var _i = 0; _i < ranking[i].children.length; _i++) {
                switch (ranking[i].children[_i].localName) {
                    case "Position":
                        Position = ranking[i].children[_i].innerHTML;
                        break;
                    case "Team":
                        Team = ranking[i].children[_i].innerHTML;
                        Team = Team.replace(" (af)", " (FG)");
                        break;
                    case "GamesPlayed":
                        GamesPlayed = parseInt(ranking[i].children[_i].innerHTML);
                        break;
                    case "GamesWon":
                        GamesWon = parseInt(ranking[i].children[_i].innerHTML);
                        break;
                    case "GamesLost":
                        GamesLost = parseInt(ranking[i].children[_i].innerHTML);
                        break;
                    case "GamesDraw":
                        GamesDraw = parseInt(ranking[i].children[_i].innerHTML);
                        break;
                    case "IndividualMatchesWon":
                        IndividualMatchesWon = parseInt(ranking[i].children[_i].innerHTML);
                        break;
                    case "IndividualMatchesLost":
                        IndividualMatchesLost = parseInt(ranking[i].children[_i].innerHTML);
                        break;
                    case "IndividualSetsWon":
                        IndividualSetsWon = parseInt(ranking[i].children[_i].innerHTML);
                        break;
                    case "IndividualSetsLost":
                        IndividualSetsLost = parseInt(ranking[i].children[_i].innerHTML);
                        break;
                    case "Points":
                        Points = parseInt(ranking[i].children[_i].innerHTML);
                        break;
                    case "TeamClub":
                        TeamClub = ranking[i].children[_i].innerHTML;
                        break;
                }
            }

            //Write in HTML
            var row = document.createElement("tr");
            row.className = "pos_" + Position;

            var cr_position = document.createElement("td");
            cr_position.innerText = Position;
            row.appendChild(cr_position);
            var cr_team = document.createElement("td");
            cr_team.innerText = Team;
            row.appendChild(cr_team);
            var cr_played = document.createElement("td");
            cr_played.innerText = GamesPlayed;
            row.appendChild(cr_played);
            var cr_won = document.createElement("td");
            cr_won.innerText = GamesWon;
            row.appendChild(cr_won);
            var cr_lost = document.createElement("td");
            cr_lost.innerText = GamesLost;
            row.appendChild(cr_lost);
            var cr_draw = document.createElement("td");
            cr_draw.innerText = GamesDraw;
            row.appendChild(cr_draw);
            var cr_points = document.createElement("td");
            cr_points.innerText = Points;
            row.appendChild(cr_points);


            node.getElementsByClassName("classementRankings")[0].appendChild(row);
        }

    }

    callback();
}

function setMatchesByDiv(resp, callback) {
    var div = Teams[Divs[rankingDone]].DivisionName;
 
    var node = document.getElementById(div);

    //Parsing Response
    var oParser = new DOMParser();
    var oDOM = oParser.parseFromString(resp, "application/xml");

    var matches = oDOM.firstElementChild.firstElementChild.firstElementChild.children;
    var nameSpace = matches[0].namespaceURI;

    for (i = 0; i < matches.length; i++) {

        if (matches[i].localName == "TeamMatchesEntries") {

            var MatchId = null;
            var WeekName = null;
            var _Date = null;
            var Time = null;
            var HomeClub = null;
            var HomeTeam = null;
            var AwayClub = null;
            var AwayTeam = null;
            var Score = "0 - 0";
            var MatchUniqueId = null;
            var IsHomeForfeited = null;
            var IsAwayForfeited = null;


            for (var _i = 0; _i < matches[i].children.length; _i++) {
                switch (matches[i].children[_i].localName) {
                    case "MatchId":
                        MatchId = matches[i].children[_i].innerHTML;
                        break;
                    case "WeekName":
                        WeekName = matches[i].children[_i].innerHTML;
                        break;
                    case "Date":
                        _Date = matches[i].children[_i].innerHTML;
                        break;
                    case "Time":
                        Time = matches[i].children[_i].innerHTML;
                        break;
                    case "HomeClub":
                        HomeClub = matches[i].children[_i].innerHTML;
                        break;
                    case "HomeTeam":
                        HomeTeam = matches[i].children[_i].innerHTML;
                        break;
                    case "AwayClub":
                        AwayClub = matches[i].children[_i].innerHTML;
                        break;
                    case "AwayTeam":
                        AwayTeam = matches[i].children[_i].innerHTML;
                        break;
                    case "Score":
                        Score = matches[i].children[_i].innerHTML;
                        Score = Score.replace("-", " - ");
                        break;
                    case "MatchUniqueId":
                        MatchUniqueId = matches[i].children[_i].innerHTML;
                        break;
                    case "IsHomeForfeited":
                        IsHomeForfeited = matches[i].children[_i].innerHTML;
                        break;
                    case "IsAwayForfeited":
                        IsAwayForfeited = matches[i].children[_i].innerHTML;
                        break;
                    
                }
            }

            //Write in HTML
            var row = document.createElement("tr");
            
            var cm_ve = document.createElement("td");
            cm_ve.innerText = HomeTeam;
            row.appendChild(cm_ve);
            var cm_vr = document.createElement("td");
            cm_vr.innerText = AwayTeam;
            row.appendChild(cm_vr);
            var cm_sc = document.createElement("td");
            cm_sc.innerText = Score;
            row.appendChild(cm_sc);
            


            node.getElementsByClassName("classementMatches")[0].appendChild(row);
        }

    }


    rankingDone++;
    callback();
}


function setMatchesDates(resp, callback) {
    //Parsing Response
    
    var oParser = new DOMParser();
    var oDOM = oParser.parseFromString(resp, "application/xml");

    var matches = oDOM.firstElementChild.firstElementChild.firstElementChild.children;
    var nameSpace = matches[0].namespaceURI;

    for (i = 0; i < matches.length; i++) {

        if (matches[i].localName == "TeamMatchesEntries") {
            var WeekName = null;
            var _Date = null;

             for (var _i = 0; _i < matches[i].children.length; _i++) {
                 switch (matches[i].children[_i].localName) {
                     case "WeekName":
                         WeekName = parseInt(matches[i].children[_i].innerHTML);
                         break;
                     case "Date":
                         _Date = matches[i].children[_i].innerHTML;
                         break;
                 }
             }

            //BREAK Case
            if (_Date == null) {
                return importMatchesDates("B");
            }

            matchesDates[WeekName] = _Date;

        }

    }
    
    callback();
}