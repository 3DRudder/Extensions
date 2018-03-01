/*
Injects frame-by-frame.js into YouTube page.
Content scripts are executed in an isolated environment, so to manipulate the player
need to execute script into the page.
http://stackoverflow.com/questions/9515704/building-a-chrome-extension-inject-code-in-a-page-using-a-content-script
https://developer.chrome.com/extensions/content_scripts.html#execution-environment
*/

var s = document.createElement('script');
s.src = chrome.extension.getURL("3dRudder-1.0.3.js");
s.onload = function() {
    console.log("[3dRudder] loaded");
    var j = document.createElement('script');
    j.src = chrome.extension.getURL("video.js");
    j.onload = function() {
        console.log("[3dRudder] extension loaded");
    };
    (document.head||document.documentElement).appendChild(j);    
};
(document.head||document.documentElement).appendChild(s);

/*chrome.storage.sync.set({'value': window.location.href }, function() {
    // Notify that we saved.
    console.log('Settings saved');
  });*/
  chrome.storage.sync.get(['value'], function(items) {
    console.log('Settings retrieved', items);
    });