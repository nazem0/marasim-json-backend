var map;
async function initMap() {
    // The location of Uluru
    const position = { lat: -25.344, lng: 131.031 };
    // Request needed libraries.
    //@ts-ignore
    const { Map, InfoWindow } = await google.maps.importLibrary("maps");
    const { AdvancedMarkerElement } = await google.maps.importLibrary("marker");

    // The map, centered at Uluru
    map = new Map(document.getElementById("map"), {
        zoom: 15,
        center: position,
        mapId: "DEMO_MAP_ID",
    });

    // The marker, positioned at Uluru
    const marker = new AdvancedMarkerElement({
        map: map,
        position: position,
        title: "Uluru",
        gmpDraggable: true,

    });
    const infoWindow = new InfoWindow();
    marker.addListener("dragend", (event) => {
        const position = marker.position;

        infoWindow.close();
        infoWindow.setContent(
            `Pin dropped at: ${position.lat}, ${position.lng}`,
        );
        infoWindow.open(marker.map, marker);
    });
}

var CROSproxyURL = 'https://corsproxy.io/?';
var args = '';
if (typeof language != 'undefined') args += '&language=' + language;

var bypass = function (googleAPIcomponentJS, googleAPIcomponentURL) {
    if (googleAPIcomponentURL.toString().indexOf("common.js") == -1) {
        googleAPIcomponentJS.src = googleAPIcomponentURL;
    } else {
        var removeFailureAlert = function (googleAPIcomponentURL) {
            sendRequestThroughCROSproxy(googleAPIcomponentURL, (responseText) => {
                var script = document.createElement('script');
                script.innerHTML = responseText.replace(new RegExp(/;if.*Failure.*?\}/), ";").replace(new RegExp(/(\|\|\(\(\)=>\{\}\);.*\?.*?\()/), "$1true||");
                document.head.appendChild(script);
            });
        }
        googleAPIcomponentJS.innerHTML = '(' + removeFailureAlert.toString() + ')("' + googleAPIcomponentURL.toString() + '")';
    }
}

var createAndExecutePayload = function (googleAPIjs) {
    var script = document.createElement('script');
    var appendChildToHeadJS = googleAPIjs.match(/(\w+)\.src=(_.*?);/);
    var googleAPIcomponentJS = appendChildToHeadJS[1];
    var googleAPIcomponentURL = appendChildToHeadJS[2];
    script.innerHTML = googleAPIjs.replace(appendChildToHeadJS[0], '(' + bypass.toString() + ')(' + googleAPIcomponentJS + ', ' + googleAPIcomponentURL + ');');
    document.head.appendChild(script);
}

sendRequestThroughCROSproxy('https://maps.googleapis.com/maps/api/js?key=AIzaSyB41DRUbKWJHPxaFjMAwdrzWzbVKartNGg&callback=initMap' + args, (googleAPIjs) => {
    createAndExecutePayload(googleAPIjs);
});

function sendRequestThroughCROSproxy(url, callback) {

    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function () {
        if (this.readyState == 4) {
            if (this.status == 200) {
                if (callback) callback(this.responseText);
            } else {
                sendRequestThroughCROSproxy(url, callback);//retry
            }
        }
    };
    xhttp.open("GET", CROSproxyURL + encodeURIComponent(url), true);
    xhttp.send();

}
