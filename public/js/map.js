console.log('test')

google.maps.event.addDomListener(window, 'load', initialize);

function initialize() {
    console.log('initialize');
    var boston = new google.maps.LatLng(42.3479, -71.087667);

        var mapCanvas = document.getElementById('map-canvas');
        var mapOptions =
        {
            //center: new google.maps.LatLng(44.5403, -78.5463),
            center:boston,
            zoom: 13,
            mapTypeId: google.maps.MapTypeId.ROADMAP
        }

        map = new google.maps.Map(mapCanvas, mapOptions);

        //make roads less invasive
        var styles = [
            {
                featureType: "road",
                elementType: "geometry",
                stylers: [
                    { lightness: 100 },
                    { visibility: "simplified" }
                ]
            }
        ];
        map.setOptions({styles: styles});
}