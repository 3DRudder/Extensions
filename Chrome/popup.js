document.addEventListener('DOMContentLoaded', () => {
    var SDK = new Sdk3dRudder();
    SDK.init();
    SDK.on('init', function(e) {
        var info = (`Server online / uid :${e.uid} / SDK version:${e.version}`);
        $("#serverInfo").text(info).addClass("alert-success");
    });
    // on tick each frame 20ms
    SDK.on('frame', function(frame) {
        var controllers = frame.controllers;
        controllers.forEach(function(element, index, array) {            
            if (element.connected) {
                $(`#connected${index}`).text(true).addClass('badge-success');
                $(`#status${index}`).text(SDK.getStatusString(element.status));
                var axis = element.axis;
                $(`#axis${index}`).text(`pitch: ${axis.pitch.toFixed(2)} / roll: ${axis.roll.toFixed(2)} / yaw: ${axis.yaw.toFixed(2)} / updown: ${axis.updown.toFixed(2)}`);
                $(`#sensors${index}`).text(element.sensors);
            } else {
                $(`#connected${index}`).text(false).removeClass('badge-success');
            }
        });
    });
    // on event SDK 3dRudder connect/disconnect
    SDK.on('connectedDevice', function(device) {        
        if (device.connected) {
            $(`#button${device.port}`).text(`3dRudder${device.port} FW:${device.firmware}`).addClass('btn-success');
        } else {
            $(`#button${device.port}`).text(`3dRudder${device.port}`).removeClass('btn-success');
        }
    });
    // error event
    SDK.on('error', function(error) {
        //document.getElementById('error').innerHTML = 'ERROR :' + error.message;
    });
    // end connection
    SDK.on('end', function() {
        $("#serverInfo").text("Server offline").addClass("alert-danger");        
    });

    $("#options").click(function() {
        if (chrome.runtime.openOptionsPage) {
            // New way to open options pages, if supported (Chrome 42+).
            chrome.runtime.openOptionsPage();
        } else {
            // Reasonable fallback.
            window.open(chrome.runtime.getURL('options.html'));
        }
    });
});