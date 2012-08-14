function strstr (haystack, needle, bool) {
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
/*
chrome.tabs.getSelected(null, function (myTab) {
    console.log(myTab);
    console.log("Preparing to load Filmow Library.");
    if (strstr(myTab.url, "filmow.com")) {
        chrome.tabs.executeScript(myTab.id, {file: "jquery.min.js"}, function() {
            chrome.tabs.executeScript(myTab.id, {file: "filmow.lib.js"}, function() {
                console.log("Filmow Library loaded with success.");
            });
        });
    } else {
        console.log("Not a Filmow tab.");
    }
});
*/
/*
chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, myTab) {
    console.log(changeInfo);
    if (strstr(myTab.url, "filmow.com")) {
        chrome.tabs.executeScript(myTab.id, {file: "jquery.min.js"}, function() {
            chrome.tabs.executeScript(myTab.id, {file: "filmow.lib.js"}, function() {
                console.log("Filmow Library loaded with success.");
            });
        });
    } else {
        console.log("Not a Filmow tab.");
    }
});
*/
function loadTabLibrary(myTab) {
    if (strstr(myTab.url, "filmow.com")) {
        chrome.tabs.executeScript(myTab.id, {file: "jquery.min.js"}, function() {
            chrome.tabs.executeScript(myTab.id, {file: "filmow.lib.js"}, function() {
                console.log("Filmow Library loaded with success.");
            });
        });
    } else {
        console.log("Not a Filmow tab.");
    }
}
chrome.tabs.onActivated.addListener(function (activeInfo) {
    console.log(activeInfo);
    chrome.tabs.getSelected(null, function (myTab) {
        console.log(myTab);
        loadTabLibrary(myTab);
    });
    chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, myTab) {
        console.log(myTab);
        loadTabLibrary(myTab);
    });
});