/**
 * File: geojsonTutorial.js
 * Purpose: Following the Using GeoJSON with Leaflet tutorial at https://leafletjs.com/examples/quick-start/
 * Author: Justin Sena
 * Date: 2024-09-19
 * For Geog 575 at University of Wisconsin Madison, Fall 2024
 */

//Having the map variable be global allows for the getData() function to work.
var map;
//function to instantiate the Leaflet map
function createMap(){

    
    //create the map
    map = L.map('map', {
        center: [20, 0],
        zoom: 2
    });

    //add OSM base tilelayer
    L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap contributors</a>'
    }).addTo(map);

    //call getData function
    getData();
};


function onEachFeature(feature, layer) {
    //no property named popupContent; instead, create html string with all properties
    var popupContent = "";
    if (feature.properties) {
        //loop to add feature property names and values to html string
        for (var property in feature.properties){
            popupContent += "<p>" + property + ": " + feature.properties[property] + "</p>";
        }
        layer.bindPopup(popupContent);
    };
};

//function to retrieve the data and place it on the map
function getData(){
    //load the data
    fetch("data\BirthRates.geojson")
        .then(function(response){
            console.log('Response received:', response);
            return response.json();            
        })
        //convert and parse
        .then(function(json){
            console.log('GeoJSON data:', json);
            //create marker options
            var geojsonMarkerOptions = {
                radius: 8,
                fillColor: "#ff7800",
                color: "#000",
                weight: 1,
                opacity: 1,
                fillOpacity: 0.8
            };
            //create a Leaflet GeoJSON layer and add it to the map
            L.geoJson(json, {
                //these are options of geoJSON
                pointToLayer: function (feature, latlng){
                    return L.circleMarker(latlng, geojsonMarkerOptions);
                },
                onEachFeature: onEachFeature
            }).addTo(map);
        })
};

document.addEventListener('DOMContentLoaded',createMap)

    
/*ARCHIVE - Original turotial code from the Using GeoJSON with Leaflet turotial
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


//---------------Add stuff to map---------------------------
    L.geoJSON(myLines, {style: myStyle}).addTo(map);
    L.geoJSON(ballField, {
        onEachFeature: onEachFeature}).addTo(map);
//----------------------------------------------------------

    var states = [{
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
    
    original totorial makeMap call
    window.onload = function() {
        makeMap();
    };

    */

//document.addEventListener('DOMContentLoaded',makeMap)