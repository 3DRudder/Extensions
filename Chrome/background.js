chrome.runtime.onInstalled.addListener(function (object) {
    chrome.tabs.create({url: "https://www.3drudder.com/tutorials/install-3drudder-video-control-chrome-extension/"}, function (tab) {
        console.log("New tab launched with http://yoursite.com/");
    });
});