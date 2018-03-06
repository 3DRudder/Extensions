var defaultSettings = {
    enable: true,
    playpause: {axis:"pitch", threshold:0.2},
    forwardrewind: {axis:"roll", speed:2, threshold:0.2},
    volume: {axis:"yaw", threshold:0.2}
};

var settings = defaultSettings;

function restoreDefault() {
    // get local storage
    chrome.storage.sync.get(defaultSettings, (items) => {                
        // display on options inputs
        $("#playpause").val(items.playpause.axis);
        $("#playpauseThreshold").val(items.playpause.threshold*100);
        $("#forwardrewind").val(items.forwardrewind.axis);
        $("#forwardrewindThreshold").val(items.forwardrewind.threshold*100);
        $("#forwardrewindSpeed").val(items.forwardrewind.speed);
        $("#volume").val(items.volume.axis);
        $("#volumeThreshold").val(items.volume.threshold*100);
        $("#activateExt").prop("checked", !items.enable);
        settings = items;            
    });
}

function resetDefault() {
    chrome.storage.sync.set(defaultSettings, function() {
        restoreDefault();
    });
}

document.addEventListener('DOMContentLoaded', () => {

    restoreDefault();    
    $("#reset").click(resetDefault);    
    $("#activateExt:checkbox").change(function() {
        settings.enable = !this.checked;
        chrome.storage.sync.set(settings);
    });
    var SDK = new Sdk3dRudder();
    SDK.init();
    /*SDK.on('frame', function(frame){
        var controller = frame.controllers[0];
        if (controller && controller.connected) {
            var current_progress = parseInt(controller.axis[settings.playpause.axis] * 100);
            var pos = current_progress > 0 ? current_progress : 0;
            var neg = current_progress < 0 ? -current_progress : 0;
            $("#playpausePBL").css("width", neg + "%").attr("aria-valuenow", neg).text(neg !== 0 ? neg + "%" : "");
            $("#playpausePBR").css("width", pos + "%").attr("aria-valuenow", pos).text(pos !== 0 ? pos + "%" : "");

            current_progress = parseInt(controller.axis[settings.forwardrewind.axis] * 100);
            pos = current_progress > 0 ? current_progress : 0;
            neg = current_progress < 0 ? -current_progress : 0;
            $("#forwardrewindPBL").css("width", neg + "%").attr("aria-valuenow", neg).text(neg !== 0 ? neg + "%" : "");
            $("#forwardrewindPBR").css("width", pos + "%").attr("aria-valuenow", pos).text(pos !== 0 ? pos + "%" : "");            

            current_progress = parseInt(controller.axis[settings.volume.axis] * 100);
            pos = current_progress > 0 ? current_progress : 0;
            neg = current_progress < 0 ? -current_progress : 0;
            $("#volumePBL").css("width", neg + "%").attr("aria-valuenow", neg).text(neg !== 0 ? neg + "%" : "");
            $("#volumePBR").css("width", pos + "%").attr("aria-valuenow", pos).text(pos !== 0 ? pos + "%" : "");
        }
    });*/
    // event input change
    $("#playpause").change(function() {
        settings.playpause.axis = $(this).val();
        chrome.storage.sync.set(settings);
    });
    $("#playpauseThreshold").change(function() {
        settings.playpause.threshold = parseInt($(this).val())/100;
        chrome.storage.sync.set(settings);        
    });
    $("#forwardrewind").change(function() {
        settings.forwardrewind.axis = $(this).val();
        chrome.storage.sync.set(settings);
    });
    $("#forwardrewindSpeed").change(function() {
        settings.forwardrewind.speed = parseFloat($(this).val());
        chrome.storage.sync.set(settings);
    });
    $("#forwardrewindThreshold").change(function() {
        settings.forwardrewind.threshold = parseInt($(this).val())/100;
        chrome.storage.sync.set(settings);
    });
    $("#volume").change(function() {
        settings.volume.axis = $(this).val();
        chrome.storage.sync.set(settings);
    });
    $("#volumeThreshold").change(function() {
        settings.volume.threshold = parseInt($(this).val())/100;
        chrome.storage.sync.set(settings);
    });

    SDK.on('init', function(e) {
        var info = (`Server online / uid: ${e.uid} / SDK version: ${e.version}`);
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