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

    var artist = $('#artist').val();
    var song = $('#song').val();
    var album = $('#album').val();
    var genre = $('#genre').val();
    var year = $('#year').val();

    queryString = "https://api.spotify.com/v1/search?q=";

    if ((artist == '') && (song == '') && (album == '') && (genre == '') && (year == '')) {
        alert('All inputs cannot be left blank');
    } else {
        if (artist != '') {
            artist = artist.replace(/ /g, '%20');
            queryString += "artist:" + artist + "&";
        };
        if (song != '') {
            song = song.replace(/ /g, '%20');
            queryString += "track:" + song + "&";
        };
        if (album != '') {
            album = album.replace(/ /g, '%20');
            queryString += "album:" + album + "&";
        };
        if (year != '') {
            queryString += "year:" + year + "&";
        };
        if (genre != '') {
            genre = genre.replace(/ /g, '%20');
            queryString += "genre:" + genre + "&";
        };
        queryString += "type=track&limit=10"
        lookupQuery(queryString);
        console.log(queryString);
    }
};

var offset = 0;
var songResults = [];

var lookupQuery = function(queryString) {
    songResults = []
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
    $(".oneSong").bind("click",function(){
        var tempThis = $(this);
        var tagNum = $(this).attr("data-id")
        for (var i = 0; i < songResults.length; i++) {
            if (tagNum == songResults[i].tagNumber) {
                $.ajax({
                    url: songResults[i].previewURL,
                    type: 'GET'
                }).success(function(response) {
                    alert("GET MP3 SUCCESSFUL")
                    response.play()
                    //console.log(response)
                })
                //var audioFile = '<audio id="playAudio" src=' + songResults[i].previewURL + 'type="audio/mp3"></audio>'; 
                //$(tempThis).append(audioFile);
                //$(tempThis).play();
            }
        }
    });
    var resNumLine = '<h3 id="linkToViewMore"> Showing Results ' + ((offset * 10) + 1) + ' - ' + ((offset * 10) + 10) + '    ></h3><br><br>';
    $(".showResults").append(resNumLine);
    $('#linkToViewMore').bind( "click", function(){
        $(".resultsTable").empty();
        $(".allResults").empty();
        offset++;
        var offsetValue = offset * 10;
        queryString += ("&offset=" + offsetValue);
        lookupQuery(queryString);
    });
    //var viewMoreButton = '<input type="button" value="View More" id="viewMoreButton" onclick="viewMore();" /><br>';
    //$(".showResults").append(viewMoreButton);
    var searchAgainButton = '<br><input type="button" value="Search Again!" id="secondSearch" onclick="searchAgain();" />';
    $(".showResults").append(searchAgainButton);
}

var viewMore = function() {
    clearResDiv();
    offset++;
    var offsetValue = offset * 10;
    queryString += ("&offset=" + offsetValue);
    console.log(queryString);
    lookupQuery(queryString);
}
var searchAgain = function() {
    $('html, body').animate({
        scrollTop: $("body").offset().top
    }, 1500);
    $(".resultsTable").empty();
    $(".allResults").empty();
}

// WHY THE FUCK DOESNT THIS WORK
var clearResDiv = function(){
    $(".oneSong").empty();
    $("tbody").empty();
    $(".resultsTable").empty();
    $(".allResults").empty();
}




