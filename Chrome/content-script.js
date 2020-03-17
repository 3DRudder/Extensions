/*
http://stackoverflow.com/questions/9515704/building-a-chrome-extension-inject-code-in-a-page-using-a-content-script
https://developer.chrome.com/extensions/content_scripts.html#execution-environment
*/

var s = document.createElement('script');
s.src = chrome.extension.getURL("3dRudder-2.0.7.js");
s.onload = function() {
    console.log("[3dRudder] loaded");
    var j = document.createElement('script');
    j.src = chrome.extension.getURL("video.js");
    j.onload = function() {
        console.log("[3dRudder] extension loaded");
        window.postMessage({ type: "FROM_PAGE", text: "Hello from the webpage!" }, "*");
        this.remove();
    };
    (document.head||document.documentElement).appendChild(j);    
};
(document.head||document.documentElement).appendChild(s);