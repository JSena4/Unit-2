/**
 * File: quickstartTutorial.js
 * Purpose: Following leaflet tutorial at https://leafletjs.com/examples/quick-start/
 * Author: Justin Sena
 * Date: 2024-09-18
 * For Geog 575 at University of Wisconsin Madison, Fall 2024
 */

function makeMap() {

// map() initializes the map in the HTML element with ID 'map'
//.setview modifies the map by establishing the starting lat/long and zoom scale
    var map = L.map('map').setView([51.505, -0.09], 13);
    
    /*tileLayer() is used to load and display tile layers on the map using the provided tileset URL
    Options used are maxZoom which sets the maximum zoom-in possible and attribution to tileset authors 
    which should always be provided */
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        //then the .addTo inherited method is used to add the tileset to the map.
        }).addTo(map);

    //marker() used to display an icon on the map at the specified lat/long. We did not utilize options.    
    var marker = L.marker([51.5, -0.09]).addTo(map);

    /*circle() is similar to marker() but creates a circle marker. Requires lat/long for its centerpoint
    We include the (perimeter)color, fillColor, fillOpacity, and radius options*/
    var circle = L.circle([51.508, -0.11], {
        color: 'red',
        fillColor: '#f03',
        fillOpacity: 0.5,
        radius: 500
    }).addTo(map);

    /*polygon() is similar to marker() but creates a polygonla marker in which you specify the vertices.
    We did not utilize any options.  Our three specified vertices creates a triangle.*/
    var polygon = L.polygon([
        [51.509, -0.08],
        [51.503, -0.06],
        [51.51, -0.047]
    ]).addTo(map);

    /*bindPopup() one of the Popup methods which binds a popup to the layer it is chained onto.
    We chain a popup off each of our marker, circle and polygon layers.  They take popup contents
    such as our simple strings and can be further chained for more sophisticated functionality.*/
    marker.bindPopup("<b>Hello world!</b><br>I am a popup.").openPopup();
    circle.bindPopup("I am a circle.");
    polygon.bindPopup("I am a polygon.");

    /*this creates a standalone popup for when you click elsewhere on the map.
    popup() is able to utilize the chained methods because they are inherited from the 
    DivOverlay group.*/
    var popup = L.popup()
    .setLatLng([51.513, -0.09])
    .setContent("I am a standalone popup.")
    .openOn(map);

    /*alert() is part of the Browser group. We use it here to log the given string and lat/long when
    onMapClick is called below.*/
    function onMapClick(e) {
        alert("You clicked the map at " + e.latlng)
    };

    //.on() is part of the Evented group
    /*According to documentation: "Leaflet deals with event listeners by reference" which allows 
    'click' to be sufficient for a click eventListener.*/
    map.on('click', onMapClick);
};

//onload function containing our overall makeMap()
window.onload = function() {
    makeMap();
};