$(document).ready(function() {
    $('.searchParameters').keypress(function(e) {
        var key = e.which;
        if (key == 13) // the enter key code
        {
            $('#searchButton').click();
            return false;
        }
    });
});
var addMoreParams = function() {
    var disp = $('#moreParams').css("display");
    if (disp == "inline") {
        $("#addParams").attr('value', 'Advanced');
        $('#moreParams').css("display", "none");
        $('#searchSection').css("height", "350px");
    } else {
        $("#addParams").attr('value', 'Basic');
        $('#moreParams').css("display", "inline");
        $('#searchSection').css("height", "420px");
        $('#addParams').css("margin-top", "0px");
        $('#searchButton').css("margin-top", "0px");
    }
};
// queryString = "https://api.spotify.com/v1/search?q=album:arrival%20artist:abba&type=track"
// https://api.spotify.com/v1/search?q=album:gold&type=track
var queryString = ''

var createQuery = function() {
    clearResDiv();
    offset = 0;

    var artist = $('#artist').val();
    var song = $('#song').val();
    var album = $('#album').val();
    var genre = $('#genre').val();
    var year = $('#year').val();

    queryString = "https://api.spotify.com/v1/search?q=";

    if ((artist == '') && (song == '') && (album == '') && (genre == '') && (year == '')) {
        console.log("No input");
    } else {
        if (artist != '') {
            artist = artist.replace(/ /g, '%20');
            queryString += "artist:" + artist + "%20";
        };
        if (song != '') {
            song = song.replace(/ /g, '%20');
            queryString += "track:" + song + "%20";
        };
        if (album != '') {
            album = album.replace(/ /g, '%20');
            queryString += "album:" + album + "%20";
        };
        if (year != '') {
            queryString += "year:" + year + "%20";
        };
        if (genre != '') {
            genre = genre.replace(/ /g, '%20');
            queryString += "genre:" + genre + "%20";
        };
        queryString += "&type=track&limit=10"
        lookupQuery(queryString);
        console.log(queryString);
    }
};

var offset = 0;
var songResults = [];

var lookupQuery = function(queryString) {
    $('html, body').animate({
        scrollTop: $(".allResults").offset().top
    }, 1500);

    $.ajax({
        url: queryString,
        type: 'GET',
        dataType: 'json'
    }).success(function(response) {
        if (response.tracks.total == 0) {
            var noResultsFound = "<h2 id='noResults'> No results found! Search again.</h2>"
            $(".allResults").append(noResultsFound);
            $(".searchParameters").trigger('reset');
        } else {
            for (var i = 0; i < response.tracks.items.length; i++) {
                var thisThing = {
                    name: response.tracks.items[i].name,
                    album: response.tracks.items[i].album.name,
                    artist: response.tracks.items[i].artists[0].name,
                    cover: response.tracks.items[i].album.images[1].url,
                    previewURL: response.tracks.items[i].preview_url,
                    tagNumber: "A" + i
                };
                songResults.push(thisThing)
            };
            renderSongs();
        }
    });
};

var renderSongs = function() {
    $(".searchParameters").trigger('reset');

    $(".allResults").empty();
    var makeNewDiv = '<div class="showResults"></div>';
    $(".allResults").append(makeNewDiv);

    var firstLine = '<table class="table table-hover resultsTable">';
    var headerLine = '<tr id="headerText"><td id="headerTD"></td><td id="headerTD"><b>Song</b></td><td id="headerTD"><b>Artist</b></td><td id="headerTD"><b>Album</b></td></tr>';
    $(".showResults").html(firstLine);
    $(".resultsTable").append(headerLine);
    for (var i = 0; i < songResults.length; i++) {
        var trackHTML = '<tr class="oneSong" data-id="' + songResults[i].tagNumber + '"><td id="coverDiv"><img id="albumCover" src="' + songResults[i].cover + '" alt="heart.png"></img></td><td id="resText">' + songResults[i].name + '</td><td id="resText">' + songResults[i].artist + '</td><td id="resText">' + songResults[i].album + '</td></tr>';
        $(".resultsTable").append(trackHTML);
    }

    var audioObject = 0;

    $(".oneSong").bind("click", function() {
        var tempThis = $(this);
        var tagNum = $(this).attr("data-id");

        for (var i = 0; i < songResults.length; i++) {
            if (tagNum == songResults[i].tagNumber) {
                if ($(tempThis).hasClass("playingCssClass")){
                    audioObject.pause();
                }
                else{
                    if (audioObject) {
                        audioObject.pause();
                    }
                    audioObject = new Audio(songResults[i].previewURL)
                    audioObject.play();
                    $(tempThis).addClass("playingCssClass");
                    audioObject.addEventListener('ended', function () {
                        $(tempThis).removeClass("playingCssClass");
                    });
                    audioObject.addEventListener('pause', function () {
                        $(tempThis).removeClass("playingCssClass");
                    });
                }
                   
            }
        }
    });


    var viewNextOrPrevDiv = '<div id="viewNextOrPrevDiv"></div>'
    $(".showResults").append(viewNextOrPrevDiv)

    if (offset > 0){
        $("#viewNextOrPrevDiv").addClass("prevExists");
        var resPrev = '<h3 id="linkToViewLess">< Previous Results </h3>';
        $("#viewNextOrPrevDiv").append(resPrev);
        $('#linkToViewLess').bind("click", function() {
            viewLess();
        });      
    }
    if (songResults.length == 10){
        var resNext = '<h3 id="linkToViewMore"> More Results > </h3><br><br>';
        $("#viewNextOrPrevDiv").append(resNext);
        $('#linkToViewMore').bind("click", function() {
            viewMore();
        });
    }
    else{
        $("#linkToViewMore").css("display", "none");
    }


    var currentResDisp = '<h3 id="curRange"> Showing Results: ' + ((offset * 10) + 1) + ' - ' + ((offset * 10) + 10) + '</h3><br>'
    $(".showResults").append(currentResDisp);
    //var viewMoreButton = '<input type="button" value="View More" id="viewMoreButton" onclick="viewMore();" /><br>';
    //$(".showResults").append(viewMoreButton);
    var searchAgainButton = '<br><input type="button" value="Search Again!" id="secondSearch" onclick="searchAgain();" />';
    $(".showResults").append(searchAgainButton);
}

var viewMore = function() {
    clearResDiv();
    offset++;
    var offsetValue = offset * 10;
    if ((queryString.search("&offset=") + 1)) {
        queryString = queryString.substring(0, queryString.length - 2);
        queryString += offsetValue;
    } else {
        queryString += ("&offset=" + offsetValue);
    }
    console.log(queryString);
    lookupQuery(queryString);
}
var viewLess = function() {
    clearResDiv();
    offset--;
    var offsetValue = offset * 10;
    if ((queryString.search("&offset=") + 1)) {
        queryString = queryString.substring(0, queryString.length - 2);
        queryString += offsetValue;
    } else {
        queryString += ("&offset=" + offsetValue);
    }
    console.log(queryString);
    lookupQuery(queryString);
}


var searchAgain = function() {
    $('html, body').animate({
        scrollTop: $("body").offset().top
    }, 1500);
    $(".resultsTable").empty();
    $(".allResults").empty();
    offset = 0;
}

var clearResDiv = function() {
    $(".allResults").empty();
    $(".resultsTable").empty();
    songResults = [];
}