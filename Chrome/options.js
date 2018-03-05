var defaultSettings = {
    playpause: {axis:"pitch", threshold:0.2},
    forwardrewind: {axis:"roll", speed:5, threshold:0.2},
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
});