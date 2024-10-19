/**
 * File: main.js
 * Author: Justin Sena
 * Date: 2024-10-03
 * Activity 6 for Geog 575 at University of Wisconsin Madison, Fall 2024
 */

var map;
console.log("var Map created")
//var minValue;
var dataStats = {};
console.log("var dataStats created")

//MAP, LEAFLET
function createMap() {
    console.log("function createMap started")
    //creates the map and attaches it to the HTML element with the ID of the first option, 'map'.
    map = L.map('map', {
        center: [8, 12],
        zoom: 2
    });

    //add base tilelayer, I used the Thunderforest.neighbourhood tileset.
    var Thunderforest_Neighbourhood = L.tileLayer('https://{s}.tile.thunderforest.com/neighbourhood/{z}/{x}/{y}.png?apikey={apikey}', {
        attribution: '© <a href="http://www.thunderforest.com/">Thunderforest</a>, © <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        apikey: '9378b71f4e404a3793c0f56478f7f04c',
        maxZoom: 5
    }).addTo(map);

    //call getData function from within Map
    getData(map);
};

//getData, AJAX Call, loads the data in the first .then, and parses the data to the four functions in the second .then
function getData(){
    console.log("function getData started")
    //load the data, loads the birth rates geojson.
    fetch("data/BirthRates.geojson")
        .then(function(response){
            return response.json();
        })
        .then(function(json){
            //pass the data to the functions that create the layers and sequencing
            var years = createYearsArray(json);
            minValue = calcStats(json);
            createPropSymbols(json, years);
            createSequenceControls(years);
            createLegend(years);
        })
};

//creates an array of the years in the json for sequencing through
function createYearsArray(data) {
    console.log("function createYearsArray started")
    var years = []; //instantiate empty array
    var properties = data.features[0].properties;

    for (var attribute in properties) {
        // Check if the attribute matches the year format (e.g., "1985 [YR1985]")
        if (/\d{4} \[YR\d{4}\]/.test(attribute)) {
            years.push(attribute);//adds the year value in it's original format to the years array
        }
    }
    console.log("Years array: " + years)//debug to see the years array being built correctly
    return years;
};

//not totally sure this function is not the problem
function calcStats(data) {
    console.log("function calcStats started");
    // Create empty array to store all data values
    var allValues = [];
    console.log("array allValues created");
    // Loop through each feature (country)
    for (var country of data.features) {
        // Loop through each year in the properties
        for (var attribute in country.properties) {
            // Check if the attribute matches the year format (e.g., "1985 [YR1985]")
            if (/\d{4} \[YR\d{4}\]/.test(attribute)) {
                // Get population value for the current year
                var value = country.properties[attribute];
                // Add value to array if it's a number
                if (!isNaN(value)) {
                    allValues.push(value);
                }
            }
        }
    }
    console.log("allValues array: " + allValues);
    // Update global dataStats object
    dataStats.min = Math.min(...allValues);
    dataStats.max = Math.max(...allValues);
    // Calculate mean value
    var sum = allValues.reduce(function(a, b) { return a + b; }, 0);
    dataStats.mean = sum / allValues.length;
    console.log("dataStats: ", dataStats);
    return dataStats.min; //Return the minimum value
};


//Add a Leaflet layer built from the GeoJSON points and add it to the map.
function createPropSymbols(data, years){
    console.log("createPropSymbols started");
    var geoJsonLayer = L.geoJson(data, {        
        pointToLayer: function(feature, latlng){
            return pointToLayer(feature, latlng, years);//call pointToLayer function
        }
        
    }).addTo(map);
    console.log("Symbols added to map.\n\n\n\n\n")
    //map.fitBounds(geoJsonLayer.getBounds()); //changes the map extent to always fit all data points in the layer
};

function logCheck(countryName) {
    console.log("Processing country: " + countryName);
}

function pointToLayer(feature, latlng, years) {
    var countryName = feature.properties["Country Name"];
    logCheck(countryName);

    console.log("pointToLayer started");
    //Use the first position array value, the first year in the dataset (1985) but if the data were to change, using the position is more flexible than the specific year.
    var attribute = years[0];

    //set the primary marker options
    var geojsonMarkerOptions = {
        fillColor: "#ff7800",
        color: "#000",
        weight: 1,
        opacity: 1,
        fillOpacity: 0.7
    };

    //For each feature, determine its value for the selected attribute
    var attValue = Number(feature.properties[attribute]);

    //Give each feature's circle marker a radius based on its attribute value
    geojsonMarkerOptions.radius = calcPropRadius(attValue); //call caldPropRadius to run the Flannery Formula to get a radius dependent upon year indicated

    //create circle markers
    var layer = L.circleMarker(latlng, geojsonMarkerOptions);

    layer.bindTooltip(countryName, {
        permanent: false, //Tooltip will only show on hover
        sticky: true,
        direction: 'top', //Position the tooltip above the marker
        className: 'country-tooltip' //Optional: Add a custom class for styling
    });

    //event listenet to close tooltip upon click so that only the popup is open
    layer.on('click', function() {
        layer.closeTooltip();
    });

    //build popup content string for popups before use of the sequencers
    var popupContent = "<p><b>Country:</b> " + feature.properties["Country Name"] + "</p>";

    // Check if the feature has properties
    if (feature.properties) {
        var year = attribute.split(" ")[0]; // Extract the year only from the feature format ("1985 [YR1985]")

        // Write the year, the birth rate, and some text to the popup
        popupContent += "<p><b>Crude birth rate in " + year + ": </b>" + feature.properties[attribute] + "</p>";
    };
    
    // Bind the popup to the circle marker
    layer.bindPopup(popupContent, {
        offset: new L.Point(0, -geojsonMarkerOptions.radius) //offsets the popup so as not to block the marker
    });

    // Return the circle marker to the L.geoJson pointToLayer option
    console.log("pointToLayer finished");
    return layer;
};

//calculate the radius of each proportional symbol
function calcPropRadius(attValue) {
    console.log("calcPropRadius started");
    //constant factor adjusts symbol sizes evenly
    var minRadius = minValue/1.5; //It'd be nice to be able to scale to window size or map size somehow.
    //Flannery Apperance Compensation formula
    var radius = 1.0083 * Math.pow(attValue/minValue,0.5715) * minRadius
    //console.log(attValue); // Check the attribute value
    console.log("calcPropRadius finished");
    console.log("radius: ", radius);
    return radius;      
};

//function creates the slider and button sequence controls
function createSequenceControls(years) {
    console.log("createSequenceControls started");
    var SequenceControl = L.Control.extend({
        options: {
            position: 'bottomleft'
        },

        onAdd: function() {
            // Create the control container div with a particular class name
            var container = L.DomUtil.create('div', 'sequence-control-container');

            // Create range input element (slider)
            container.insertAdjacentHTML('beforeend', '<input class="range-slider" type="range">');

            // Add skip buttons
            container.insertAdjacentHTML('beforeend', '<button class="step" id="reverse" title="Reverse"><img src="img/noun-left-arrow-4163466.png"></button>'); 
            container.insertAdjacentHTML('beforeend', '<button class="step" id="forward" title="Forward"><img src="img/noun-right-arrow-4163821.png"></button>');

            // Disable any mouse event listeners for the container
            L.DomEvent.disableClickPropagation(container);

            // Set slider attributes
            var slider = container.querySelector(".range-slider");
            slider.max = 6; // The highest the slider can go
            slider.value = 0; // The starting point of the slider
            slider.step = 1; // Increments the slider moves in

            // Input listener for slider
            slider.addEventListener('input', function() {
                var index = this.value;
                console.log("Slider moved to index position: " + index); // Debug to see that slider works correctly
                updatePropSymbols(years[index]); // Change the prop symbol (radius) to indicate trends in the data
            });

            // Click listener for buttons
            container.querySelectorAll('.step').forEach(function(step) {
                step.addEventListener("click", function() {
                    // Moves index based on slider value in case you already changed it with the slider
                    var index = slider.value; // Make sure the buttons change the index based on the position of the slider if it has been used

                    // Increment or decrement the index value depending on which button is clicked
                    if (step.id == 'forward') {
                        index++;
                        index = index > 6 ? 0 : index;
                        console.log("Forward button clicked, new index: " + index);
                    } else if (step.id == 'reverse') {
                        index--;
                        index = index < 0 ? 6 : index;
                        console.log("Reverse button clicked, new index: " + index);
                    }

                    // Update slider to move the thumb to the new index position
                    slider.value = index;

                    // Pass new attribute to update symbols (change the radius)
                    updatePropSymbols(years[index]);

                    updateLegend(years[index]);
                });
            });
            console.log("Sequence controls created.\n\n\n\n\n")
            return container;
        }
    });

    map.addControl(new SequenceControl()); // Add listeners after adding control
}

function createLegend(attributes) {
    console.log("createLegend started.");
    var LegendControl = L.Control.extend({
        options: {
            position: 'bottomright'
        },

        onAdd: function () {
            // create the control container with a particular class name
            var container = L.DomUtil.create('div', 'legend-control-container');

            container.innerHTML = '<h3 class="temporalLegend">Showing Data for <span class="year">1985</span></h3>';


            // Step 1: start attribute legend svg string
            var svg = '<svg id="attribute-legend" width="130px" height="65px">';

            // array of circle names to base loop on
            var circles = ["max", "mean", "min"];

            // Check dataStats values
            console.log("dataStats:", dataStats);

            // Step 2: loop to add each circle and text to svg string
            for (var i = 0; i < circles.length; i++) {
                // Step 3: assign the r and cy attributes
                var radius = calcPropRadius(dataStats[circles[i]]);
                var cy = 30 - radius;

                // circle string
                svg += '<circle class="legend-circle" id="' + circles[i] + '" r="' + radius + '" cy="' + cy + '" fill="#F47821" fill-opacity="0.8" stroke="#000000" cx="50"/>';
                console.log("SVG after adding circle:", svg);

                //evenly space out labels            
            var textY = i * 12+10;            

            //text string            
            svg += '<text id="' + circles[i] + '-text" x="70" y="' + textY + '">' + Math.round(dataStats[circles[i]]*100)/100 + '</text>';
            }

            // close svg string
            svg += "</svg>";

            // add attribute legend svg to container
            container.insertAdjacentHTML('beforeend', svg);

            console.log("Final SVG string:", svg);

            container.insertAdjacentHTML('beforeend', "<small>per 1,000 people annually</small><small>Data Source: worldbank.org</small>");


            return container;
        }
    });

    map.addControl(new LegendControl());
    console.log("Legend control added to the map.");
};


function updateLegend(attribute) {
    // Extract the year from the attribute
    var year = attribute.match(/\d{4}/)[0];
    // Update the legend text
}

function updatePropSymbols(attribute) {
    // Iterate over each layer on the map
    map.eachLayer(function(layer) {
        // Check if the layer has a feature and the specified attribute
        if (layer.feature && layer.feature.properties[attribute]) {
            var props = layer.feature.properties;

            // Calculate the radius based on the attribute value
            var radius = calcPropRadius(props[attribute]);
            layer.setRadius(radius);

            // Create the popup content
            var popupContent = "<p><b>Country: </b>" + props["Country Name"] + "</p>";
            var year = attribute.match(/\d{4}/)[0]; // Extract the year from the attribute

            //update temporal legend
            document.querySelector("span.year").innerHTML = year;

            popupContent += "<p><b>Crude birth rate in " + year + ": </b>" + props[attribute] + "</p>";

            // Update the popup content
            var popup = layer.getPopup();            
            popup.setContent(popupContent).update();
        }
    });

    // Update the legend with the current attribute
    updateLegend(attribute);
}


//first event listener creates the map upon the page loading
document.addEventListener('DOMContentLoaded', createMap);
//second listener resizes the Leaflet map to fit the window when the window size is changed