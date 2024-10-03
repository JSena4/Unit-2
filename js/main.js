/**
 * File: main.js
 * Author: Justin Sena
 * Date: 2024-10-03
 * Activity 6 for Geog 575 at University of Wisconsin Madison, Fall 2024
 */

var map;
var minValue;

//MAP, LEAFLET
function createMap() {
    //creates the map and attaches it to the HTML element with the ID of the first option, 'map'.
    map = L.map('map', {
        center: [0, 0],
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
    //load the data, loads the birth rates geojson.
    fetch("data/BirthRates.geojson")
        .then(function(response){
            return response.json();
        })
        .then(function(json){
            //pass the data to the functions that create the layers and sequencing
            var years = createYearsArray(json);
            minValue = calculateMinValue(json);
            createPropSymbols(json, years);
            createSequenceControls(years);
        })
};

//creates an array of the years in the json for sequencing through
function createYearsArray(data) {
    var years = []; //instantiate empty array
    var properties = data.features[0].properties;

    for (var attribute in properties) {
        // Check if the attribute matches the year format (e.g., "1985 [YR1985]")
        if (/\d{4} \[YR\d{4}\]/.test(attribute)) {
            years.push(attribute);//adds the year value in it's original format to the years array
        }
    }
    //console.log(years)//debug to see the years array being built correctly
    return years;
};

//Minimum value is needed for the Flannery Appearance Compensation Formula for creating proportional symbol sizes.
function calculateMinValue(data) {
    // Create an empty array to store all data values
    var allValues = [];

    //get the number of features in the GeoJSON data
    //More flexible this way instead of using the specific years
    var numFeatures = data.features.length;
    
    // Loop through each country in BirthRates.geojson
    for (var i = 0; i < numFeatures; i++) {
        var country = data.features[i];

        //Loop through each property in the country's properties, kind of overkill I think but protects from bad data
        for (var propertyName in country.properties) {
            //check if the property name matches the pattern for the years
            if (propertyName.match(/^\d{4} \[YR\d{4}\]$/)) {
                var value = country.properties[propertyName];
                //Add the value to the array if it exists
                if (value !== undefined) {
                    allValues.push(value);
                }
            }
        }
    };    
    // Get the minimum value of the array (min value is needed for Flannery Formula)
    // The ... is a "spread operator" which passes all elements of the allValues array as arguments to Math.min
    var minValue = Math.min(...allValues);
    console.log("Min Values: " + minValue);
    
    return minValue;
};

//Add a Leaflet layer built from the GeoJSON points and add it to the map.
function createPropSymbols(data, years){
    var geoJsonLayer = L.geoJson(data, {
        pointToLayer: function(feature, latlng){
            return pointToLayer(feature, latlng, years);//call pointToLayer function
        }
    }).addTo(map);
    map.fitBounds(geoJsonLayer.getBounds()); //changes the map extent to always fit all data points in the layer
};

//Sets the benchmark symbology for the layer created from the GeoJSON.
function pointToLayer(feature, latlng, years){
    //Use the first position array value, the first year in the dataset (1985) but if the data were to change, using the position is more flexible than the specific year.
    var attribute = years[0];

    //set the primary marker options
    var geojsonMarkerOptions = {
        fillColor: "#ff7800",
        color: "#000",
        weight: 1,
        opacity: 1,
        fillOpacity: 0.7,
    };

    //For each feature, determine its value for the selected attribute
    var attValue = Number(feature.properties[attribute]);

    //Give each feature's circle marker a radius based on its attribute value
    geojsonMarkerOptions.radius = calcPropRadius(attValue); //call caldPropRadius to run the Flannery Formula to get a radius dependent upon year indicated

    //create circle markers
    var layer = L.circleMarker(latlng, geojsonMarkerOptions);

    //build popup content string for popups before use of the sequencers
    var popupContent = "<p><b>Country:</b> " + feature.properties["Country Name"] + "</p>";

    // Check if the feature has properties
    if (feature.properties) {
        var year = attribute.split(" ")[0]; // Extract the year only from the feature format ("1985 [YR1985]")

        // Write the year, the birth rate, and some text to the popup
        popupContent += "<p><b>Crude birth rate in " + year + ": </b>" + feature.properties[attribute] + "</p>";

        // Additional information at the bottom of the popup, source citing
        popupContent += "<small>per 1,000 people</small><br><small>Data Source: worldbank.org</small></p>";
    };

    // Bind the popup to the circle marker
    layer.bindPopup(popupContent, {
        offset: new L.Point(0, -geojsonMarkerOptions.radius) //offsets the popup so as not to block the marker
    });

    // Return the circle marker to the L.geoJson pointToLayer option
    return layer;
};

//calculate the radius of each proportional symbol
function calcPropRadius(attValue) {
    //constant factor adjusts symbol sizes evenly
    var minRadius = minValue/1.5; //It'd be nice to be able to scale to window size or map size somehow.
    //Flannery Apperance Compensation formula
    var radius = 1.0083 * Math.pow(attValue/minValue,0.5715) * minRadius
    //console.log(attValue); // Check the attribute value
    return radius;
};

//function creates the slider and button sequence controls
function createSequenceControls(years){
    //create range input element (slider)
    var slider = "<input class='range-slider' type='range'></input>";
    document.querySelector("#panel").insertAdjacentHTML('beforeend',slider);

    //create sequence step buttons
    document.querySelector('#panel').insertAdjacentHTML('beforeend','<button class="step" id="reverse">Reverse</button>');//creates the reverse button in the #panel <div>
    document.querySelector('#panel').insertAdjacentHTML('beforeend','<button class="step" id="forward">Forward</button>');//creates the forward button in the #panel <div>
    document.querySelector('#reverse').insertAdjacentHTML('beforeend',"<img src='img/noun-left-arrow-4163466.png'>")//adds right arrow to any element in the #reverse class
    document.querySelector('#forward').insertAdjacentHTML('beforeend',"<img src='img/noun-right-arrow-4163821.png'>")//adds right arrow to any element in the #forward class

    //set slider attributes
    document.querySelector(".range-slider").max = 6; //The highest the slider can go
    //document.querySelector(".range-slider").min = 0;  This is unnecessary
    document.querySelector(".range-slider").value = 0; //The starting point of the slider
    document.querySelector(".range-slider").step = 1; //incriments the slider moves in

    //Input listener for slider, changes the index value which impacts the popup, and the buttons that read from whichever position index equals.
    document.querySelector('.range-slider').addEventListener('input', function(){
        var index = this.value;
        console.log("Slider moved to index position: " + index); //debug to see that slider works correctly
        updatePropSymbols(years[index]); //change the prop symbol (radius) to indicate trends in the data
    });

    //Click listener for buttons, the buttons were given the class "step"
    document.querySelectorAll('.step').forEach(function(step){
        step.addEventListener("click", function(){
            //moves index based on slider value in case you already changed it with the slider.
            //will be at 0 if untouched, will be where you left slider if moved
            var index = document.querySelector('.range-slider').value; //make sure the buttons change the index based on the position of the slider if it has been used

            //increment or decrement the index value depending on which button is clicked
            if (step.id == 'forward'){
                index++;
                index = index > 6 ? 0 : index;
                console.log("Forward button clicked, new index: " + index);
            } else if (step.id == 'reverse'){
                index--;
                index = index < 0 ? 6 : index;
                console.log("Reverse button clicked, new index: " + index);
            };

            //update slider to move the thumb to the new index position
            document.querySelector('.range-slider').value = index;

            //pass new attribute to update symbols (change the radius)
            updatePropSymbols(years[index]);
        });
    });
};



function updatePropSymbols(attribute){
    // Iterate over each layer on the map (there's only one, but maybe we built it this way because there will eventually be more??)
    map.eachLayer(function(layer){
        // Check if the layer has a feature and the specified attribute (again I can only imagine we did this because we might incorporate differeing datasets)
        if (layer.feature && layer.feature.properties[attribute]){
            var props = layer.feature.properties;

            // Calculate the radius based on the attribute value
            var radius = calcPropRadius(props[attribute]);
            layer.setRadius(radius);

            // Create the popup content
            var popupContent = "<p><b>Country: </b>" + props["Country Name"] + "</p>";
            var year = attribute.match(/\d{4}/)[0]; // Extract the year from the attribute
            popupContent += "<p><b>Crude birth rate in " + year + ": </b>" + props[attribute] + "</p>";
            popupContent += "<small>per 1,000 people</small><br><small>Data Source: worldbank.org</small></p>";

            // Update the popup content
            var popup = layer.getPopup();            
            popup.setContent(popupContent).update();
        };
    });
};

//first event listener creates the map upon the page loading
document.addEventListener('DOMContentLoaded', createMap);
//second listener resizes the Leaflet map to fit the window when the window size is changed

//this isn't working
window.addEventListener('resize', function(){
    map.invalidateSize();
});