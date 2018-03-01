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
                $(`#status${index}`).text(element.status);
                $(`#axis${index}`).text(JSON.stringify(element.axis));
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
});