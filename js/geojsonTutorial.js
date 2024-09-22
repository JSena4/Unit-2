/**
 * File: geojsonTutorial.js
 * Purpose: Following the Using GeoJSON with Leaflet tutorial at https://leafletjs.com/examples/quick-start/
 * Author: Justin Sena
 * Date: 2024-09-19
 * For Geog 575 at University of Wisconsin Madison, Fall 2024
 */

function makeMap() {

    // Your Leaflet map code here
    var map = L.map('map').setView([48.75621, -104.99404], 4);

            
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        }).addTo(map);

    /*
        var ballField = {
        "type": "Feature",
        "properties": {
        "name": "Coors Field",
        "amenity": "Baseball Stadium",
        "popupContent": "This is where the Rockies play!"
        },
        "geometry": {
            "type": "Point",
            "coordinates": [-104.99404, 39.75621]
        }
    };

    function onEachFeature(feature, layer) {
        if (feature.properties && feature.properties.popupContent) {
            layer.bindPopup(feature.properties.popupContent);
        }
    }

    //ballField.bindPopup("<b>Hello world!</b><br>I am a popup.").openPopup();

    var myLines = [{
        "type": "LineString",
        "coordinates": [[-100, 40], [-105, 45], [-110, 55]]
    }, {
        "type": "LineString",
        "coordinates": [[-105, 40], [-110, 45], [-115, 55]]
    }];

    //create a myStyle variable to plug into the geoJSON method adding the lines to the map.
    var myStyle = {
        "color": "#ff7800",
        "weight": 10,
        "opacity": 0.35
    };


    var myLayer = L.geoJSON().addTo(map);
    myLayer.addData(ballField);

    /*

//---------------Add stuff to map---------------------------
    L.geoJSON(myLines, {style: myStyle}).addTo(map);
    L.geoJSON(ballField, {
        onEachFeature: onEachFeature}).addTo(map);
//----------------------------------------------------------

/*var states = [{
    "type": "Feature",
    "properties": {"party": "Republican"},
    "geometry": {
        "type": "Polygon",
        "coordinates": [[
            [-104.05, 48.99],
            [-97.22,  48.98],
            [-96.58,  45.94],
            [-104.03, 45.94],
            [-104.05, 48.99]
        ]]
    }
}, {
    "type": "Feature",
    "properties": {"party": "Democrat"},
    "geometry": {
        "type": "Polygon",
        "coordinates": [[
            [-109.05, 41.00],
            [-102.06, 40.99],
            [-102.03, 36.99],
            [-109.04, 36.99],
            [-109.05, 41.00]
        ]]
    }
}];

L.geoJSON(states, {
    style: function(feature) {
        switch (feature.properties.party) {
            case 'Republican': return {color: "black"};
            case 'Democrat':   return {color: "#0000ff"};
        }
    }
}).addTo(map);



var geojsonMarkerOptions = {
    radius: 8,
    fillColor: "#ff7800",
    color: "#000",
    weight: 1,
    opacity: 1,
    fillOpacity: 0.8
};

L.geoJSON(someGeojsonFeature, {
    pointToLayer: function (feature, latlng) {
        return L.circleMarker(latlng, geojsonMarkerOptions);
    }
}).addTo(map);

*/

var someFeatures = [{
    "type": "Feature",
    "properties": {
        "name": "Coors Field",
        "show_on_map": true
    },
    "geometry": {
        "type": "Point",
        "coordinates": [-104.99404, 39.75621]
    }
}, {
    "type": "Feature",
    "properties": {
        "name": "Busch Field",
        "show_on_map": true
    },
    "geometry": {
        "type": "Point",
        "coordinates": [-104.98404, 39.74621]
    }
}];

L.geoJSON(someFeatures, {
    filter: function(feature, layer) {
        return feature.properties.show_on_map;
    }
}).addTo(map);

    //creates the alert window that shows the lat/long of where you clicked
    function onMapClick(e) {
        alert("You clicked the map at " + e.latlng)
    }




    map.on('click', onMapClick);
    
    };
    
    window.onload = function() {
        makeMap();
    };