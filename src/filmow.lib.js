function strstr(haystack, needle, bool) {
    var pos = 0;
    haystack += '';
    pos = haystack.indexOf(needle);
    if (pos == -1) {
        return false;
    } else {
        if (bool) {
            return haystack.substr(0, pos);
        } else {
            return haystack.slice(pos);
        }
    }
}
function explode(delimiter, string, limit) {
    var emptyArray = {
        0: ''
    };
    // third argument is not required
    if (arguments.length < 2 || typeof(arguments[0]) == 'undefined' || typeof(arguments[1]) == 'undefined') {
        return null;
    }
    if (delimiter === '' || delimiter === false || delimiter === null) {
        return false;
    }
    if (typeof(delimiter) == 'function' || typeof(delimiter) == 'object' || typeof(string) == 'function' || typeof(string) == 'object') {
        return emptyArray;
    }
    if (delimiter === true) {
        delimiter = '1';
    }
    if (!limit) {
        return string.toString().split(delimiter.toString());
    }
    // support for limit argument
    var splitted = string.toString().split(delimiter.toString());
    var partA = splitted.splice(0, limit - 1);
    var partB = splitted.join(delimiter.toString());
    partA.push(partB);
    return partA;
}

var sourceWebURL = "http://filmow.com";

var movieSourceURL = function(id) {
    return sourceWebURL + "/atalho/filme/" + id + "/";
};

var torrentSearchURL = function(keywords) {
    return "http://thepiratebay.se/search/" + encodeURI(keywords) + "/0/99/200";
};

// Usually the HTML ID property of the elements with this class, 
// has the ID of the movie in the next format: movie_id-%ID%
var movieListItemClass = ".movie_list_item"; 


function torrentsLightbox(elementId) {
    this.elementId = elementId;
    this.elementCreatedBefore = function() {
        return ($("#" + this.elementId).size() > 0);
    };
    this.element = (this.elementCreatedBefore()) ? $("#" + this.elementId) : $("<div id=\"" + this.elementId + "\" />");
    this.elementDefaultStyle = {
        "position": "absolute",
        "top": "50%",
        "left": "50%",
        "margin-left": "-400px",
        "margin-top": "-200px",
        "width": "800px",
        "max-height": "600px",
        "padding": "10px",
        "border-radius": "5px",
        "background-color": "#FFF",
        "overflow": "auto",
        "z-index": "99999"
    };
    this.closeBoxButton = "<a href='javascript:void(0);' onClick='$(this).parent().fadeOut();'><strong>FECHAR</strong></a>";
    this.applyDefaultStyle = function() {
        if (!this.elementCreatedBefore()) {
            this.element.css(this.elementDefaultStyle);
            this.element.hide();
            $("body").append(this.element);
            this.element = $("#" + this.elementId);
        }
    };
    this.updateLinks = function() {
        this.element.find(".detName").each(function() {
            $(this).children("a").each(function() {
                $(this).attr("href", "http://thepiratebay.se" + $(this).attr("href"));
            });
        });
    };
    this.removeUselessThings = function() {
        this.element.find(".header").each(function() {
            $(this).children("th").each(function() {
                $(this).find("a").each(function() {
                    var htmlContent = $(this).html();
                    $(this).after(htmlContent);
                    $(this).remove();
                });
            });
        });
    };
    this.cleanLinks = function() {
        this.element.find("a").each(function() {
            var href = $(this).attr("href");
            if (!strstr(href, "magnet:?") && !strstr(href, "http://thepiratebay.se") && !strstr(href, "torrents.thepiratebay.se")) {
                var htmlContent = $(this).html();
                $(this).after(htmlContent);
                $(this).remove();
            }
        });
    };
    this.setContent = function(content) {
        this.element.html(content);
        this.updateLinks();
        this.removeUselessThings();
        this.cleanLinks();
        this.element.prepend(this.closeBoxButton);
    };
    this.showTheBox = function() {
        this.applyDefaultStyle();
        this.element.fadeIn();
        this.element.animate({
            "top": $("body").scrollTop(),
            "margin-top": "20px"
        }, "slow");
    };
}

function searchTorrentLink(movieId) {
    this.movieId = movieId;
    this.movieName = null;
    this.element = $("<a />");
    this.elementPosition = {
        "position": "relative",
        "top": "0px",
        "left": "0px"
    };
    this.elementLabel = "SEARCH TORRENTS";
    
    this.callbackWhenGetTorrents = (function(_this) {
        return function(data) {
            var torrentBox = new torrentsLightbox("filmow-torrents-box");
            if (strstr(data, "No hits. Try adding an asterisk in you search phrase.")) {
                torrentBox.setContent("Nothing found for '" + _this.movieName + "'. Maybe you should try other trackers? Perhaps isoHunt?");
            } else {
                var torSearchDOM = $("<div />").html(data);
                var tableSearchResult = torSearchDOM.find("#searchResult");
                tableSearchResult.css("width", "100%");
                torrentBox.setContent(tableSearchResult);
            }
            torrentBox.showTheBox();
        };
    })(this);
    
    this.traversingSearchMovieName = function(data) {
        var $data = jQuery("<div />").html(data.replace("<script", "<scriptnowork"));
        //console.log($data);
        var shortcutMovies = $data.find(".movie_shortcut").find(".right_content");
        var candidates = shortcutMovies.find(".item");
        var it = 0, myMovieName = null;
        for (it = 0; it < candidates.length; it++) {
            var textCandidate = candidates.eq(it).text(), prefixText = "Título Original:";
            var textCandidateSlices = textCandidate.slice(textCandidate.indexOf(prefixText)+prefixText.length);
            if (typeof textCandidateSlices.length != "undefined") {
                myMovieName = $.trim(textCandidateSlices);
                console.log(myMovieName);
                break;
            }
        }
        this.movieName = myMovieName;
        return this.movieName;
    };
    this.callbackWhenGetMovieInfos = (function(_this) {
        return function(data) {
            _this.traversingSearchMovieName(data);
            $.get(torrentSearchURL(_this.movieName), _this.callbackWhenGetTorrents);
        };
    })(this);
    
    this.clickTrigger = (function(_this) {
        return function() {
            $.get(movieSourceURL(_this.movieId), _this.callbackWhenGetMovieInfos);
        };
    })(this);
    
    this.create = function() {
        this.element.css(this.elementPosition);
        this.element.html(this.elementLabel);
        this.element.click(this.clickTrigger);
        return this.element;
    };
}

function FilmowTorrent() {
    this.libraryIsLoaded = function() {
        return ($("body").attr("torrents") === "loaded")
    };
    this.setLibraryLoaded = function() {
        $("body").attr("torrents", "loaded");
    };
    
    this.searchForPosters = function() {
        $(".posters").each(function() {
            var myUrl = $(this).attr("href");
            var expURI = explode("/", myUrl);
            var it = 0;
            var movieId = null;
            for (it = 0; it <= expURI.length; it++) {
                if ($.trim(expURI[it]) != "") {
                    movieId = $.trim(expURI[it]);
                    console.log(movieId);
                }
            }
            $(this).parent().append(new searchTorrentLink(movieId).create());
        });
    };
    this.searchForLists = function() {
        $(movieListItemClass).each(function() {
            var myId = $(this).attr("id");
            myId = myId.slice(myId.indexOf("_id-")+4);
            $(this).append(new searchTorrentLink(movieId).create());
        });
    };
    this.init = function() {
        if (!this.libraryIsLoaded()) {
            this.searchForLists();
            this.searchForPosters();
            this.setLibraryLoaded();
        }
    };
}

// make the request at movieSourceURL(id), and to get the original title to search the torrent you should run
// trought this DOM path of the returned data:
// .movie_shortcut > .right_content > p[class="item"]
// verify if the resultant text of the element content has the ocurrence: "Título Original:"
// the name of the movie is the following text.

(function() {
    new FilmowTorrent().init();
})();