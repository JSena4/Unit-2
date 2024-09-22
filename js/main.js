/**
 * File: main.js
 * Author: Justin Sena
 * Date: 2024-09-14
 * For Geog 575 at University of Wisconsin Madison, Fall 2024
 */

/*
// Add all scripts to the JS folder
function myFunc() {
    var myDiv = document.getElementById("mydiv");
    myDiv.innerHTML = "Hello World";
}
console.log('TESTING');
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
    var Thunderforest_Neighbourhood = L.tileLayer('https://{s}.tile.thunderforest.com/neighbourhood/{z}/{x}/{y}.png?apikey={apikey}', {
        attribution: '© <a href="http://www.thunderforest.com/">Thunderforest</a>, © <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        apikey: '9378b71f4e404a3793c0f56478f7f04c',
        maxZoom: 22
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
    fetch("data/MegaCities.geojson")
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
document.addEventListener('resize', function() {
    map.invalidateSize();
});

/*ARCHIVE -- Original exercise code using MegaCities.geoJSON

function debugCallback(data) {
    document.querySelector("#mydiv")
        .insertAdjacentHTML('beforeend', 'GeoJSON data: ' + JSON.stringify(data));
}


function debugAjax() {
    fetch("data/MegaCities.geojson")
        .then(function(response) {
            return response.json(); // Parse the JSON data
        })
        .then(function(data) {
            debugCallback(data); // Pass the parsed data to the callback

        })
        .catch(function(error) {
            console.error('Error fetching data:', error);
            document.querySelector("#mydiv")
                .insertAdjacentHTML('beforeend', '<br>Error fetching data:<br>' + error.message);
        });
};

//initialize function called when the script loads
function initialize() {
    createCitiesTable();
};

// Function to create a table with cities and their populations
function createCitiesTable() {
    var cityPop = [
        {
            city: 'Madison',
            population: 233209
        },
        {
            city: 'Milwaukee',
            population: 594833
        },
        {
            city: 'Green Bay',
            population: 104057
        },
        {
            city: 'Superior',
            population: 27244
        }
    ];
   
    // Create an HTML table element
    var table = document.createElement("table");

    // Create a header row
    var headerRow = document.createElement("tr");

    //add the "City" and "Population" columns to the header row
    headerRow.insertAdjacentHTML("beforeend","<th>City</th><th>Population</th>");
   
    // Add the "City" column
    var cityHeader = document.createElement("th");
    cityHeader.innerHTML = "City";
    headerRow.appendChild(cityHeader);

    // Add the "Population" column
    var popHeader = document.createElement("th");
    popHeader.innerHTML = "Population";
    headerRow.appendChild(popHeader);

    // Add the row to the table
    table.appendChild(headerRow);

    //loop to add a new row for each city
    for(var i = 0; i < cityPop.length; i++){
        //assign longer html strings to a variable
        var rowHtml = "<tr><td>" + cityPop[i].city + "</td><td>" + cityPop[i].population + "</td></tr>";
        //add the row's html string to the table
        table.insertAdjacentHTML('beforeend',rowHtml);
    };

    // Loop to add a new row for each city
    for (var i = 0; i < cities.length; i++) {
        var tr = document.createElement("tr");

        var city = document.createElement("td");
        city.innerHTML = cities[i];
        tr.appendChild(city);

        var pop = document.createElement("td");
        pop.innerHTML = population[i];
        tr.appendChild(pop);

        table.appendChild(tr);
    }

    // Add the table to the div in index.html
    var myDiv = document.querySelector("#mydiv");
    myDiv.appendChild(table);
};


// Call the initialize and jsAjax functions when the window has loaded
window.onload = function() {
    initialize();
    debugAjax();
};
*/