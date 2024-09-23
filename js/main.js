/**
 * File: main.js
 * Author: Justin Sena
 * Date: 2024-09-22
 * Activity 5 for Geog 575 at University of Wisconsin Madison, Fall 2024
 */

/*Having the map variable be global allows for the getData() function to work.
and since it's initialized with var, it can be overwritten from within the createMap() function.*/
var map;

//function to instantiate the Leaflet map
function createMap(){
    
    //create the map and attaches it to the HTML element with the ID of the first option, 'map'.
    map = L.map('map', {
    });

    //add base tilelayer, I used the Thunderforest.neighbourhood tileset.
    //I wouldn't use this moving forward but I went through the work of the apikey so its stays for this assignment.
    var Thunderforest_Neighbourhood = L.tileLayer('https://{s}.tile.thunderforest.com/neighbourhood/{z}/{x}/{y}.png?apikey={apikey}', {
        attribution: '© <a href="http://www.thunderforest.com/">Thunderforest</a>, © <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        apikey: '9378b71f4e404a3793c0f56478f7f04c',
        maxZoom: 5 //maxZoom set to 5 because seeing the country referenced is all the detail needed.
    }).addTo(map); //add the tileset to the map

    //call getData function from within Map
    getData();
};

// Function to retrieve the data and place it on the map
function getData(){
    // Load the data
    fetch("data/BirthRates.geojson") //fetches the geojson
        .then(function(response){ //after the request, run function passed the promise response
            console.log('Response received:', response); //log response properties to console for debugging
            return response.json(); //converts the response to json
        })
        //reads HTTP response and parses as json
        .then(function(json){
            console.log('GeoJSON data:', json); //log json to console for debugging

            /*I wanted to try using an imported icon. The iconOptions are established prior to the 
            pointToLayer function return requires them.*/
            var iconOptions = L.icon({
                iconUrl: 'img/baby.png',
                iconSize: [30] //the icon was originally huge, had to reduce it to a reasonable size.
            });

            // Create a Leaflet GeoJSON layer with the fetched data and add it to the map
            var geoJsonLayer = L.geoJson(json, {
                /*The pointToLayer option runs a function that takes "feature" as a parameter. It is 
                automatically populated with the current GeoJSON feature. This hung me up... 
                The function creates marker symbols that apply latlng and iconOptions*/
                pointToLayer: function (feature, latlng){  
                    return L.marker(latlng, { icon: iconOptions }); 
                },
                //run the on each feature function to apply and configure the pop-ups.
                onEachFeature: onEachFeature
            }).addTo(map);
            // Fit the map bounds to the GeoJSON layer.  All this function chaining is crazy on the brain!
            map.fitBounds(geoJsonLayer.getBounds());
        });
};

//This function configures the pop-up contents and behavior.
function onEachFeature(feature, layer) {
    //create variable for holding HTML string with pulls from the geoJSON
    var popupContent = "";
    //nested ifs check for the Country Name object and prints it at the top of the popup in H3.
    if (feature.properties) {
        if (feature.properties["Country Name"]) {
            popupContent += "<h3>" + feature.properties["Country Name"] + "</h3>";
        }
        //loop to add the year information down the rest of the popup, only printing the first 4 digits
        for (var property in feature.properties){
            if (property !== "Country Name") {
                popupContent += "<p>" + property.substring(0, 4) + ": " + feature.properties[property] + "</p>";
            }
            
        }
        //additional information at the bottom of the popup
        popupContent += "<p><small>per 1,000 people.</small>" + "<br>" + "<br>" + "<small>Data Source: worldbank.org</small></p>";
        layer.bindPopup(popupContent);
    };
};

//first event listener creates the map upon the page loading
document.addEventListener('DOMContentLoaded', createMap);
//second listener resizes the Leaflet map to fit the window when the window size is changed
//I'm using this more so to accomodate any window size in use, not just upon resizings.
window.addEventListener('resize', function(){
    map.invalidateSize();
});

//-----------------------------------------------------------
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