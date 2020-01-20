DEBUG = false;

if (DEBUG) {
    var apiUrl = "http://127.0.0.1:8000";
} else {
    var apiUrl = "https://apistuff499.herokuapp.com";
}


var creds = {
    username : "defaultuser",
    password : "tFya9ysrcP",
    access : null,
    refresh : null, 
}


var getInitialTokens = function() {
    return $.post(apiUrl + "/api/token/",{
        username: creds.username, password: creds.password
    }).then(function(data){
        assert(!!data.refresh && !!data.access);
        creds.access = data.access;
        creds.refresh = data.refresh;
    }).fail(function() {
        console.log("Login failed");
    })
};

var theButtons = ["#getMovie", "#getBook"];

var disableButtons = function () {
    theButtons.forEach(x => {
        $(x).prop("disabled", true);
    });
};

var enableButtons = function () {
    theButtons.forEach(x => {
        $(x).prop("disabled", false);
    });
};


var getMovie = function(title, year, summarytype) {
    qp = {}
    if (!!title) qp.title = title;
    if (!!year) qp.year = year;
    if (!!summarytype) qp.summarytype = summarytype;
    if (Object.keys(qp).length === 0) {
        return;
    } else {
        return ajaxWithRefreshRetry({
            url: apiUrl + "/getMovie/",
            data: qp
        });
    }
}

var getBook = function(isbn) {
    assert(!!isbn);
    return ajaxWithRefreshRetry({
        url: apiUrl + "/getBook/",
        data: {"isbn": isbn}
    }).then(function(x) {
        dLog("getBook success", x);
        return x
    });
}

// () -> Deferred
var doRefresh = function () {
    assert(!!creds.refresh && !!creds.access);
    return $.post(apiUrl + "/api/token/refresh/", {
        refresh: creds.refresh
    }).then(function(data) {
        assert(!!data.access);
        creds.access = data.access;
    });
};


var ajaxWithAccessToken = function(settings) {
    assert(!!creds.access);
    if (!settings.headers) { settings.headers = {} };
    settings.headers["Authorization"] = "Bearer " + creds.access;
    return $.ajax(settings)
};

// settings -> Deferred
var ajaxWithRefreshRetry = function(settings)  {
    assert(!!creds.access&& !!creds.refresh);
    var dfd = $.Deferred();
    ajaxWithAccessToken(settings).then(function(data) {
        dLog('success without retry', data)
        dfd.resolve(data);
    }).fail(function(jqXHR, txt, err) {
        if (jqXHR.status === 401) { // unauthorized, retry
            doRefresh().then(function() {
                return ajaxWithAccessToken(settings);
            }).then(function(data) {
                dLog('success after retry', data)
                dfd.resolve(data);
            }).fail(function(jqXHR, txt, err) {
                dfd.reject(jqXHR, txt, err);
            });
        } else {
            dfd.reject(jqXHR, txt, err);
        }
    });
    return dfd;
};

$(document).ready(function() {

    disableButtons(); 
    getInitialTokens().then(function(data) {
        enableButtons();
        if (DEBUG) {
            $("#bookISBN").val("0201558025"); 
        }
    });

    $("#getMovie").click(function () {
        var title = $("#movieTitle").val();
        var year = $("#movieYear").val();
        var st = $("#movieST").val();
        assert(st === "full" || st === "short");
        $("#movieInfo").empty().append("Loading...");
        getMovie(title, year, st).then(function(data) {
            if (data.Response === "False") {
                var el = $("<p></p>").text("No information available.");
            } else {
                var el = mkMovieInfo(data);
            }
            $("#movieInfo").empty().append(el);
        }).fail(function() {
            $("#movieInfo").empty().append("Failed to load information.");
        });
    });
    $("#getBook").click(function () {
        var s = $("#bookISBN").val();
        if (s.length === 0) {
            return;
        }
        $("#bookInfo").empty().append("Loading...");
        getBook(s).then(function(data) {
            if (Object.keys(data).length === 0) {
                var el = $("<p></p>").text("No information available for that ISBN.");
            } else {
                var el = mkBookInfo(data);
            }
            $("#bookInfo").empty().append(el);
        }).fail(function(jqXHR, txt, err) {
            $("#bookInfo").empty().append("Failed to load information.");
        });
    });
});

var pairsToTable = function(pairs) {
    var tbody = $("<tbody></tbody>");
    pairs.forEach(p => {
        assert(p.length === 2);
        var tr = $("<tr></tr>");
        tr.append($("<td></td>").append(p[0]));

        if (typeof p[1] === 'string' || p[1] instanceof String) {
            tr.append($("<td></td>").append(p[1]));
        } else {
            tr.append($("<td></td>").append(JSON.stringify(p[1])));
        }
        tbody.append(tr);
    });
    var table = $("<table></table>");
    table.addClass("table table-bordered table-sm")
    table.append(tbody);
    return table;
};

var pairsAll = function(d) {
    r = [];
    Object.keys(d).forEach(k => {
        r.push([k, d[k]]);
    });
    return r;
};

var pairsSome = function(d, ks) {
    r = [];
    ks.forEach(k => {
        r.push([k, d[k]])
    });
    return r;
};

var pairsExcept = function(d, ks) {
    r = [];
    Object.keys(d).forEach(k => {
        if (!ks.includes(k)) {
            r.push([k, d[k]]);
        }
    });
    return r;
};


var mkMovieInfo = function(data) {
    pairs = pairsExcept(data, ["Ratings"]);
    return pairsToTable(pairs);
};

var mkBookInfo = function(data) {
    var bk = data[Object.keys(data)[0]];

    var pairs1 = [
        ["title", bk.details.title],
        ["publish_date", bk.details.publish_date]
    ];
    var pairs2 = pairsExcept(bk, ["details"]);
    var pairs3 = pairsExcept(bk.details, ["title", "publish_date"]);
    var pairs = pairs1.concat(pairs2, pairs3)
    return pairsToTable(pairs);


};


var dLog = function(){
    if (DEBUG) {
        console.log.apply(console, arguments);
    }
}

var assert = function(condition, message) { 
if (!condition) {
  debugger;
  throw Error("Assert failed" + (typeof message !== "undefined" ? ": " + message : ""));
}
};

