document.addEventListener('DOMContentLoaded', () => {
    var ITEMS;
    // get local storage
    chrome.storage.sync.get((items) => {
        console.log(items);
        if (jQuery.isEmptyObject(items)) {            
            items = {
                playpause: {axis:"pitch", threshold:0.2},
                forwardrewind: {axis:"yaw", speed:1, threshold:0.2},
                volume: {axis:"roll", threshold:0.2}
            };
            chrome.storage.sync.set(items);
        }
        // display on options inputs
        $("#playpause").val(items.playpause.axis);
        $("#playpauseThreshold").val(items.playpause.threshold*100);
        $("#forwardrewind").val(items.forwardrewind.axis);
        $("#forwardrewindThreshold").val(items.forwardrewind.threshold*100);
        $("#forwardrewindSpeed").val(items.forwardrewind.speed);
        $("#volume").val(items.volume.axis);
        $("#volumeThreshold").val(items.volume.threshold*100);
        ITEMS = items;        
    });

    // event input change
    $("#playpause").change(function() {
        ITEMS.playpause.axis = $(this).val();
        chrome.storage.sync.set(ITEMS);
    });
    $("#playpauseThreshold").change(function() {
        ITEMS.playpause.threshold = parseInt($(this).val())/100;
        chrome.storage.sync.set(ITEMS);
    });
    $("#forwardrewind").change(function() {
        ITEMS.forwardrewind.axis = $(this).val();
        chrome.storage.sync.set(ITEMS);
    });
    $("#forwardrewindSpeed").change(function() {
        ITEMS.forwardrewind.speed = parseFloat($(this).val());
        chrome.storage.sync.set(ITEMS);
    });
    $("#forwardrewindThreshold").change(function() {
        ITEMS.forwardrewind.threshold = parseInt($(this).val())/100;
        chrome.storage.sync.set(ITEMS);
    });
    $("#volume").change(function() {
        ITEMS.volume.axis = $(this).val();
        chrome.storage.sync.set(ITEMS);
    });
    $("#volumeThreshold").change(function() {
        ITEMS.volume.threshold = parseInt($(this).val())/100;
        chrome.storage.sync.set(ITEMS);
    });
});