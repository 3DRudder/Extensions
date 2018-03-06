document.addEventListener('DOMContentLoaded', () => {
    var SDK = new Sdk3dRudder();
    SDK.init();
    SDK.on('init', function(e) {
        var info = (`Server online`);
        $("#serverInfo").text(info).addClass("alert-success");
    });
});