// GLOBAL

var letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
var rankingValue = ["NC", "E6", "E4", "E2", "E0", "D6", "D4", "D2", "D0", "C6", "C4", "C2", "C0", "B6", "B4", "B2", "B0","A"]



var Divs = [];
var Teams = {};
var NumTeam = 0;
var matchesDates = new Array(23);
var Calendrier = [];

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

    importCalendrier();
    
}

function Init() {

    var st = document.getElementById("SelectTeam");

    // List Of Divisions
    for (var int = 0; int < Divs.length; int++) {
        var t = Teams[Divs[int]];
        var option = document.createElement("option");
        option.text = t.DivisionName + " - Presgaux " + t.Team;
        option.value = t.DivisionName;
        st.add(option);

    }

    var option = document.createElement("option");
    option.text = "Toutes";
    option.value = "All";
    st.add(option);

    //LocalStorage
    var check = localStorage.getItem('_Storage_StatInd');
    if (check != null) {   
        if (check == "true") {
            document.getElementById("StatInd").checked = true;
            changeRI(true); 
        }
                
    }
    var checkNM = localStorage.getItem('_Storage_NextMatches');
    if (checkNM != null) {   
        if (checkNM == "true") {
            document.getElementById("NextMatches").checked = true;
            changeNM(true); 
        }
                
    }
    var value = localStorage.getItem('_Storage_SelectTeam');
    if (value != null) {       
        for (var i = 0; i < st.options.length; i++) {
            if (st.options[i].value == value) {
                st.selectedIndex = i;
            }
        }
    }

    hideLoader();
};

function importCalendrier() {
    var xml = '<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:tab="http://api.frenoy.net/TabTAPI">'
            +   '<soapenv:Header/>'
            +   '<soapenv:Body>'
            +       '<tab:GetMatchesRequest>'
            +           '<tab:Club>N115</tab:Club>'
            +       '</tab:GetMatchesRequest>'
            +   '</soapenv:Body>'
            + '</soapenv:Envelope>'


    soap(xml, setCalendrier, importTeams);
}

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
    if (week == 0) {
        var now = new Date();
        for (var i = matchesDates.length - 1; i > 0; i--) {
            var md = new Date(matchesDates[i]);
            if (now > md) {
                week = i;
                i = 0;
            }
        }
    }
    weekParam = '<tab:WeekName>' + week + '</tab:WeekName>';

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
    }
    weekParam = '<tab:WeekName>' + week + '</tab:WeekName>';

    var xml = '<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:tab="http://api.frenoy.net/TabTAPI">'
        + '<soapenv:Header/>'
        + '<soapenv:Body>'
        + '<tab:GetMatchesRequest>'
        + '<tab:DivisionId>' + divId + '</tab:DivisionId>'
        + weekParam
        + '<tab:WithDetails>YES</tab:WithDetails>'
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
function setCalendrier(resp, callback) {
    Calendrier = [];
    for (var i = 1; i <= 22; i++) { Calendrier[(i)] = {} }

    var oParser = new DOMParser();
    var oDOM = oParser.parseFromString(resp, "application/xml");

    var matches = oDOM.firstElementChild.firstElementChild.firstElementChild.children;
    var nameSpace = matches[0].namespaceURI;

    var LastTeamLetter = "";
    var NumberOfTeam = 0;

    for (i = 1; i < matches.length; i++) {

        var week = null;
        var MatchId = null;
        var HomeClub = null;
        var HomeTeam = null;
        var AwayClub = null;
        var AwayTeam = null;
        var IsHomeForfeited = null;
        var IsAwayForfeited = null;

        var Date = "";
        var Time = "";
        var _Date = "";
        var _Time = "";

        for (var _i = 0; _i < matches[i].children.length; _i++) {
            switch (matches[i].children[_i].localName) {
                case "WeekName":
                    week = matches[i].children[_i].innerHTML;
                    if (week[0] == 0) { week = week.substr(1) }
                    week = parseInt(week);
                    break;
                case "MatchId":
                    MatchId = matches[i].children[_i].innerHTML;
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
                case "IsHomeForfeited":
                    IsHomeForfeited = matches[i].children[_i].innerHTML;
                    break;
                case "IsAwayForfeited":
                    IsAwayForfeited = matches[i].children[_i].innerHTML;
                    break;
                case "Date":
                    _Date = matches[i].children[_i].innerHTML;
                    break;
                case "Time":
                    _Time = matches[i].children[_i].innerHTML;
                    break;
            }
        }

        if (AwayClub != "-" && HomeClub != "-") {
            Date = _Date;
            Time = _Time.substring(0, _Time.length - 3);
        } else if (AwayClub == "-") { AwayTeam = "BYE" }
        else if (HomeClub == "-") { HomeTeam = "BYE" }


        var isHome = (HomeClub == "N115");

        var TeamLetter;
        if (isHome) {
            TeamLetter = HomeTeam[HomeTeam.length - 1];
        } else {
            TeamLetter = AwayTeam[AwayTeam.length - 1];
        }
        if (TeamLetter != LastTeamLetter) {
            NumberOfTeam++;
            LastTeamLetter = TeamLetter;
        }


        Calendrier[week][TeamLetter] = {};

        Calendrier[week][TeamLetter]["MatchId"] = MatchId;
        Calendrier[week][TeamLetter]["Date"] = Date;
        Calendrier[week][TeamLetter]["Time"] = Time;
        Calendrier[week][TeamLetter]["HomeClub"] = HomeClub;
        Calendrier[week][TeamLetter]["HomeTeam"] = HomeTeam;
        Calendrier[week][TeamLetter]["AwayClub"] = AwayClub;
        Calendrier[week][TeamLetter]["AwayTeam"] = AwayTeam;
        Calendrier[week][TeamLetter]["isHome"] = isHome;
        Calendrier[week][TeamLetter]["IsHomeForfeited"] = IsHomeForfeited;
        Calendrier[week][TeamLetter]["IsAwayForfeited"] = IsAwayForfeited;

    }

    NumTeam = NumberOfTeam;
    callback()
}

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


            for (var i2 = 0; i2 < teams[i].children.length; i2++) {
                switch (teams[i].children[i2].localName) {
                    case "TeamId":
                        TeamId = teams[i].children[i2].innerHTML;
                        break;
                    case "Team":
                        Team = teams[i].children[i2].innerHTML;
                        break;
                    case "DivisionId":
                        DivisionId = teams[i].children[i2].innerHTML;
                        break;
                    case "DivisionName":
                        DivisionName = teams[i].children[i2].innerHTML.split(" - ")[0].split(" ")[1];
                        break;
                    case "DivisionCategory":
                        DivisionCategory = teams[i].children[i2].innerHTML;
                        break;
                    case "MatchType":
                        MatchType = teams[i].children[i2].innerHTML;
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
    if (week == 0) {
        var now = new Date();
        for (var j = matchesDates.length - 1; j > 0; j--) {
            var md = new Date(matchesDates[j]);
            if (now > md) {
                week = j;
                j = 0;
            }
        }
    }

    var classement = document.getElementById("exempleClassement").cloneNode(true);
    classement.id = div;
    document.getElementById("exempleClassement").parentNode.appendChild(classement);

    
    var node = document.getElementById(div);
    node.getElementsByClassName("ch_divName")[0].innerHTML = div;
    node.getElementsByClassName("cw_week")[0].innerHTML = week;
    

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


            for (var i2 = 0; i2 < ranking[i].children.length; i2++) {
                switch (ranking[i].children[i2].localName) {
                    case "Position":
                        Position = ranking[i].children[i2].innerHTML;
                        break;
                    case "Team":
                        Team = ranking[i].children[i2].innerHTML;
                        Team = Team.replace(" (af)", " (FG)");
                        break;
                    case "GamesPlayed":
                        GamesPlayed = parseInt(ranking[i].children[i2].innerHTML);
                        break;
                    case "GamesWon":
                        GamesWon = parseInt(ranking[i].children[i2].innerHTML);
                        break;
                    case "GamesLost":
                        GamesLost = parseInt(ranking[i].children[i2].innerHTML);
                        break;
                    case "GamesDraw":
                        GamesDraw = parseInt(ranking[i].children[i2].innerHTML);
                        break;
                    case "IndividualMatchesWon":
                        IndividualMatchesWon = parseInt(ranking[i].children[i2].innerHTML);
                        break;
                    case "IndividualMatchesLost":
                        IndividualMatchesLost = parseInt(ranking[i].children[i2].innerHTML);
                        break;
                    case "IndividualSetsWon":
                        IndividualSetsWon = parseInt(ranking[i].children[i2].innerHTML);
                        break;
                    case "IndividualSetsLost":
                        IndividualSetsLost = parseInt(ranking[i].children[i2].innerHTML);
                        break;
                    case "Points":
                        Points = parseInt(ranking[i].children[i2].innerHTML);
                        break;
                    case "TeamClub":
                        TeamClub = ranking[i].children[i2].innerHTML;
                        break;
                }
            }

            //Write in HTML
            var row = document.createElement("tr");
            row.className = "pos_" + Position;
            if (TeamClub == "N115") {
                row.classList.add("myTeam");
            }

            var cr_position = document.createElement("td");
            cr_position.innerText = Position;
            cr_position.className = "textAlignCenter";
            row.appendChild(cr_position);
            var cr_team = document.createElement("td");
            cr_team.innerText = Team;
            cr_team.className = "textAlignRight";
            cr_team.style.padding = "1px 1px 1px 10px";
            row.appendChild(cr_team);
            var cr_played = document.createElement("td");
            cr_played.innerText = GamesPlayed;
            cr_played.className = "textAlignCenter";
            row.appendChild(cr_played);
            var cr_won = document.createElement("td");
            cr_won.innerText = GamesWon;
            cr_won.className = "textAlignCenter";
            row.appendChild(cr_won);
            var cr_lost = document.createElement("td");
            cr_lost.innerText = GamesLost;
            cr_lost.className = "textAlignCenter";
            row.appendChild(cr_lost);
            var cr_draw = document.createElement("td");
            cr_draw.innerText = GamesDraw;
            cr_draw.className = "textAlignCenter";
            row.appendChild(cr_draw);
            var cr_points = document.createElement("td");
            cr_points.innerText = Points;
            cr_points.className = "textAlignCenter";
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
            var MatchDetails = null;


            for (var i2 = 0; i2 < matches[i].children.length; i2++) {
                switch (matches[i].children[i2].localName) {
                    case "MatchId":
                        MatchId = matches[i].children[i2].innerHTML;
                        break;
                    case "WeekName":
                        WeekName = matches[i].children[i2].innerHTML;
                        break;
                    case "Date":
                        _Date = matches[i].children[i2].innerHTML;
                        break;
                    case "Time":
                        Time = matches[i].children[i2].innerHTML;
                        break;
                    case "HomeClub":
                        HomeClub = matches[i].children[i2].innerHTML;
                        break;
                    case "HomeTeam":
                        HomeTeam = matches[i].children[i2].innerHTML;
                        HomeTeam = HomeTeam.replace("Vrij", "BYE");
                        break;
                    case "AwayClub":
                        AwayClub = matches[i].children[i2].innerHTML;
                        break;
                    case "AwayTeam":
                        AwayTeam = matches[i].children[i2].innerHTML;
                        AwayTeam = AwayTeam.replace("Vrij", "BYE");
                        break;
                    case "Score":
                        Score = matches[i].children[i2].innerHTML;
                        Score = Score.replace("-", " - ");
                        Score = Score.replace("0 ff (af)", "FG");
                        Score = Score.replace("0 ff", "FF");
                        break;
                    case "MatchUniqueId":
                        MatchUniqueId = matches[i].children[i2].innerHTML;
                        break;
                    case "IsHomeForfeited":
                        IsHomeForfeited = matches[i].children[i2].innerHTML;
                        break;
                    case "IsAwayForfeited":
                        IsAwayForfeited = matches[i].children[i2].innerHTML;
                        break;
                    case "MatchDetails":
                        MatchDetails = matches[i].children[i2].children;
                        break;
                    
                }
            }

            //Write in HTML
            var row = document.createElement("tr");
            if (HomeClub == "N115" || AwayClub == "N115") {
                var isHome = (HomeClub == "N115");
                //row.classList.add("myTeam");
                var s = Score.replace("FF", "0").replace("FG", "0").split(" - ");
                var HSc = parseInt(s[0]);
                var ASc = parseInt(s[1]);
                if (HSc == ASc) {
                    row.classList.add("mDraw");
                } else if ((isHome && HSc > ASc) || (!isHome && HSc < ASc) ) {
                    row.classList.add("mWon");
                } else {
                    row.classList.add("mLost");
                }

                //Resultat Ind
                if (MatchDetails[0].innerHTML == 'true') {
                    var HPs = [];
                    var APs = [];
                    var Matchs = [];

                    for (var i3 = 0; i3 < MatchDetails.length; i3++) {
                        switch (MatchDetails[i3].localName) {
                            case "HomePlayers":
                                for (var j = 0; j < MatchDetails[i3].children.length; j++) {
                                    if (MatchDetails[i3].children[j].localName == "Players") {
                                        var p = xmlToPlayer(MatchDetails[i3].children[j].children);
                                        HPs[p.position] = p;
                                    }
                                }                                
                                break;
                            case "AwayPlayers":
                                for (var j = 0; j < MatchDetails[i3].children.length; j++) {
                                    if (MatchDetails[i3].children[j].localName == "Players") {
                                        var p = xmlToPlayer(MatchDetails[i3].children[j].children);
                                        APs[p.position] = p;
                                    }
                                }
                                break;
                            case "IndividualMatchResults":
                                var m = xmlToMatch(MatchDetails[i3].children);
                                Matchs[m.position] = m;
                                break;
                        }
                    }

                    for (var i4 = 1; i4 < Matchs.length; i4++) {
                        var m = Matchs[i4];
                        if (m != undefined && !m.wo) {
                            if (m.homeWon) {
                                HPs[m.hpi].won.push(APs[m.api].ranking);
                                APs[m.api].lost.push(HPs[m.hpi].ranking);
                            } else {
                                HPs[m.hpi].lost.push(APs[m.api].ranking);
                                APs[m.api].won.push(HPs[m.hpi].ranking);
                            }
                        }
                    }

                    //Write in HTML RI
                    var Players;
                    if (isHome) {
                        Players = HPs;
                    } else {
                        Players = APs;
                    }
                    for (var i2 = 1; i2 < Players.length; i2++) {
                        var rowRI = document.createElement("tr");
                        var td = document.createElement("td");
                        td.innerText = Players[i2].name;
                        rowRI.appendChild(td);

                        var td = document.createElement("td");
                        td.className = "textAlignCenter";
                        td.innerText = Players[i2].victory;
                        rowRI.appendChild(td);

                        var td = document.createElement("td");
                        var div = document.createElement("div");
                        div.className = "flexContainer";
                        for (var i3 = 0; i3 < Players[i2].won.length; i3++) {
                            var span = document.createElement("span");
                            span.innerText = Players[i2].won[i3];
                            if (rankingValue.indexOf(Players[i2].ranking) < rankingValue.indexOf(Players[i2].won[i3])) {
                                span.className = "Perf";
                            }
                            div.appendChild(span);
                        }
                        td.appendChild(div);
                        rowRI.appendChild(td);
                        node.getElementsByClassName("classementRI")[0].appendChild(rowRI);

                        var td = document.createElement("td");
                        var div = document.createElement("div");
                        div.className = "flexContainer";
                        for (var i3 = 0; i3 < Players[i2].lost.length; i3++) {
                            var span = document.createElement("span");
                            span.innerText = Players[i2].lost[i3];
                            if (rankingValue.indexOf(Players[i2].ranking) > rankingValue.indexOf(Players[i2].lost[i3])) {
                                span.className = "Contre";
                            }
                            div.appendChild(span);
                        }
                        td.appendChild(div);
                        rowRI.appendChild(td);
                        node.getElementsByClassName("classementRI")[0].appendChild(rowRI);
                    }

                } else {
                    node.getElementsByClassName("classementRI")[0].className = "classementRI_notCreated";
                }

                //Next matches
                var weekNumber = parseInt(WeekName) ;
                var teamLetter = null;
                if (HomeClub == "N115") {
                    teamLetter = HomeTeam.substr(HomeTeam.length - 1);
                } else {
                    teamLetter = AwayTeam.substr(AwayTeam.length - 1);
                }

                var Cal1 = Calendrier[weekNumber + 1][teamLetter];
                node.getElementsByClassName("nextMatches1")[0].innerText = transformDate(Cal1.Date, weekNumber + 1) + " : " + Cal1.HomeTeam + " contre " + Cal1.AwayTeam + " à " + (Cal1.Time || "00:00") ;

                var Cal2 = Calendrier[weekNumber + 2][teamLetter];
                node.getElementsByClassName("nextMatches2")[0].innerText = transformDate(Cal2.Date, weekNumber + 2) + " : " + Cal2.HomeTeam + " contre " + Cal2.AwayTeam + " à " + (Cal2.Time || "00:00") ;

                var Cal3 = Calendrier[weekNumber + 3][teamLetter];
                node.getElementsByClassName("nextMatches3")[0].innerText = transformDate(Cal3.Date, weekNumber + 3) + " : " + Cal3.HomeTeam + " contre " + Cal3.AwayTeam + " à " + (Cal3.Time || "00:00") ;

            }


            
            var cm_ve = document.createElement("td");
            cm_ve.innerText = HomeTeam;
            cm_ve.className = "textAlignCenter";
            row.appendChild(cm_ve);
            var cm_vr = document.createElement("td");
            cm_vr.innerText = AwayTeam;
            cm_vr.className = "textAlignCenter";
            row.appendChild(cm_vr);
            var cm_sc = document.createElement("td");
            cm_sc.innerText = Score;
            cm_sc.className = "textAlignCenter";
            row.appendChild(cm_sc);
            


            node.getElementsByClassName("classementMatches")[0].appendChild(row);
        }

    }


    rankingDone++;
    callback();
}


function xmlToPlayer(nodeCollection) {
    var Position;
    var FirstName;
    var LastName;
    var Ranking;
    var VictoryCount;
    var IsForfeited = false;

    for (var i = 0; i < nodeCollection.length; i++) {       
        switch (nodeCollection[i].localName) {
            case "Position":
                Position = nodeCollection[i].innerHTML;
                break;
            case "FirstName":
                FirstName = nodeCollection[i].innerHTML;
                break;
            case "LastName":
                LastName = nodeCollection[i].innerHTML;
                break;
            case "Ranking":
                Ranking = nodeCollection[i].innerHTML;
                if (Ranking == "NG") {
                    Ranking = "NC";
                }
                break;
            case "VictoryCount":
                VictoryCount = nodeCollection[i].innerHTML;
                break;
            case "IsForfeited":
                IsForfeited = (nodeCollection[i].innerHTML == "true");
                break;
        }
    }

    var p = {
        position: Position,
        name: FirstName + "   " + LastName[0] + ".",
        ranking: Ranking,
        victory: VictoryCount,
        won: [],
        lost: []
    }
    if (IsForfeited) {
        p.victory = "WO";
    }
    return p;
}

function xmlToMatch(nodeCollection) {
    var Position;
    var HomePlayerMatchIndex;
    var AwayPlayerMatchIndex;
    var IsAwayForfeited = false;
    var IsHomeForfeited = false;
    var AwaySetCount = 0;
    var HomeSetCount = 0;

    for (var i = 0; i < nodeCollection.length; i++) {
        switch (nodeCollection[i].localName) {
            case "Position":
                Position = parseInt( nodeCollection[i].innerHTML);
                break;
            case "HomePlayerMatchIndex":
                HomePlayerMatchIndex = parseInt( nodeCollection[i].innerHTML);
                break;
            case "AwayPlayerMatchIndex":
                AwayPlayerMatchIndex = parseInt( nodeCollection[i].innerHTML);
                break;
            case "IsAwayForfeited":
                IsAwayForfeited = (nodeCollection[i].innerHTML == "true");
                break;
            case "IsHomeForfeited":
                IsHomeForfeited = (nodeCollection[i].innerHTML == "true");
                break;
            case "HomeSetCount":
                HomeSetCount = parseInt(nodeCollection[i].innerHTML);
                break;
            case "AwaySetCount":
                AwaySetCount = parseInt(nodeCollection[i].innerHTML);
                break;
        }
    }

    var m = {
        position: Position,
        hpi: HomePlayerMatchIndex,
        api: AwayPlayerMatchIndex,
        homeWon: (HomeSetCount > AwaySetCount),
        wo: (IsHomeForfeited || IsAwayForfeited)
    }
    return m;
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

             for (var i2 = 0; i2 < matches[i].children.length; i2++) {
                 switch (matches[i].children[i2].localName) {
                     case "WeekName":
                         WeekName = parseInt(matches[i].children[i2].innerHTML);
                         break;
                     case "Date":
                         _Date = matches[i].children[i2].innerHTML;
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

// Button Function
function show() {
    //Delete old ranking
    for (var i = 0; i < Divs.length; i++) {
        var e = document.getElementById(Teams[Divs[i]].DivisionName);
        e.parentNode.removeChild(e);
    }
    //import new ones
    importRankings();
}

function download() {
    var week = document.getElementById("SelectWeek").value;
    if (week == 0) {
        var now = new Date();
        for (var j = matchesDates.length - 1; j > 0; j--) {
            var md = new Date(matchesDates[j]);
            if (now > md) {
                week = j;
                j = 0;
            }
        }
    }

    var v = document.getElementById("SelectTeam").value;
    var element;

    if (v == "All") {
        element = document.createElement("div");
        for (var i = 0; i < Divs.length; i++) {
            var e = document.getElementById(Teams[Divs[i]].DivisionName).cloneNode(true);
            element.appendChild(changeForPrint(e));
            var pb = document.createElement("div");
            pb.className = "html2pdf__page-break";
            element.appendChild(pb);
        }
        element.removeChild(element.lastChild);
    } else {
        element = changeForPrint( document.getElementById(v).cloneNode(true) );
    } 
    var opt = {
        margin: 0,
        filename: 'Classement_J'+week+'_'+v+'.pdf',
        image: { type: 'jpeg', quality: 1 },
        html2canvas: { scale: 1.8 },
        jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
    };
    html2pdf().from(element).set(opt).save();
}


function changeForPrint(element) {
    
    element.style.width = "795px";
    element.style.minWidth  = "795px";
    element.style.maxWidth = "795px";
    element.style.height = "1000px";
    element.style.borderStyle = "hidden";

    element.getElementsByClassName("classementWeek")[0].style.marginTop = "60px";

    if (!document.getElementById("StatInd").checked) {
        var el2 = element.getElementsByClassName("classementMatches")[0];
        el2.style.marginTop = "150px";
        el2.style.marginBottom = "150px";

    }

    return element;
}


function changeRI(check) {
    localStorage.setItem("_Storage_StatInd", check);
    var RIs = document.getElementsByClassName("classementRI");
    for (var i = 0; i < RIs.length; i++) {
        if (check) {
            RIs[i].className = "classementRI";
        } else {
            RIs[i].className = "classementRI displayNone";
        }
        
    }

}

function changeNM(check) {
    localStorage.setItem("_Storage_NextMatches", check);
    var RIs = document.getElementsByClassName("nextMatches");
    for (var i = 0; i < RIs.length; i++) {
        if (check) {
            RIs[i].className = "nextMatches";
        } else {
            RIs[i].className = "nextMatches displayNone";
        }
        
    }

}

function changeSelectTeam(value) {
    localStorage.setItem("_Storage_SelectTeam", value);
}

function transformDate(dateString, weekNumber){
    if (dateString == "") {dateString = matchesDates[weekNumber]}
    var d = dateString.split('-');
    return d[2]+"-"+d[1]+"-"+d[0];
}