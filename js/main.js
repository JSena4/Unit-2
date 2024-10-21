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

var differences;
var useDifferenceColors = false;


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
            var averages = calculateAverages(json, years);
            differences = calculateDifferences(json, averages, years);
            createSequenceControls(years, averages);
            createLegend(years, averages);
            addToggleCheckbox(map, differences, years);            
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
        fillColor: "#e66101",
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
        direction: 'top', //Position the tooltip above the cursor
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
    //constant factor adjusts symbol sizes evenly
    var minRadius = minValue/1.5; //It'd be nice to be able to scale to window size or map size somehow.
    //Flannery Apperance Compensation formula
    var radius = 1.3083 * Math.pow(attValue/minValue,0.5715) * minRadius
    //console.log(attValue); // Check the attribute value
    return radius;      
};

//function creates the slider and button sequence controls
// Function creates the slider and button sequence controls
function createSequenceControls(years, averages) {
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

            // Add a label to display the current year
            container.insertAdjacentHTML('beforeend', '<div class="slider-label"><span id="current-year">' + years[0].match(/\d{4}/)[0] + '</span></div>');

            // Disable any mouse event listeners for the container
            L.DomEvent.disableClickPropagation(container);

            // Set slider attributes
            var slider = container.querySelector(".range-slider");
            slider.max = years.length - 1; // The highest the slider can go
            slider.value = 0; // The starting point of the slider
            slider.step = 1; // Increments the slider moves in

            // Input listener for slider
            slider.addEventListener('input', function() {
                var index = this.value;
                console.log("Slider moved to index position: " + index); // Debug to see that slider works correctly
                updatePropSymbols(years[index]); // Change the prop symbol (radius) to indicate trends in the data
                document.getElementById('current-year').textContent = years[index].match(/\d{4}/)[0]; // Update the year label
                updateLegend(years[index], averages); // Update the legend with the current year and average
            });

            // Click listener for buttons
            container.querySelectorAll('.step').forEach(function(step) {
                step.addEventListener("click", function() {
                    // Moves index based on slider value in case you already changed it with the slider
                    var index = slider.value; // Make sure the buttons change the index based on the position of the slider if it has been used

                    // Increment or decrement the index value depending on which button is clicked
                    if (step.id == 'forward') {
                        index++;
                        index = index > years.length - 1 ? 0 : index;
                        console.log("Forward button clicked, new index: " + index);
                    } else if (step.id == 'reverse') {
                        index--;
                        index = index < 0 ? years.length - 1 : index;
                        console.log("Reverse button clicked, new index: " + index);
                    }

                    // Update slider to move the thumb to the new index position
                    slider.value = index;

                    // Pass new attribute to update symbols (change the radius and color)
                    updatePropSymbols(years[index]);

                    // Update the year label
                    document.getElementById('current-year').textContent = years[index].match(/\d{4}/)[0];

                    updateLegend(years[index], averages); // Update the legend with the current year and average
                });
            });
            console.log("Sequence controls created.\n\n\n\n\n")
            return container;
        }
    });

    map.addControl(new SequenceControl()); // Add listeners after adding control
}


function createLegend(attributes, averages) {
    console.log("createLegend started.");
    var LegendControl = L.Control.extend({
        options: {
            position: 'bottomright'
        },

        onAdd: function () {
            // Create the control container with a particular class name
            var container = L.DomUtil.create('div', 'legend-container');

            // Create a separate SVG for the yearMean circle
            var yearMeanSvg = '<svg id="yearMean-legend">';
            var yearMeanRadius = calcPropRadius(averages[attributes[0]]);
            var fixedBottom = 70; // Fixed bottom position for the circle
            var yearMeanCy = fixedBottom - yearMeanRadius;
            var yearMeanCx = 157;

            // SVG to add circle
            yearMeanSvg += '<circle class="legend-circle" id="yearMean" r="' + yearMeanRadius + '" cy="' + yearMeanCy + '" fill="none" stroke="yellow" stroke-width="2" cx="' + yearMeanCx + '"/>';

            yearMeanSvg += '<text id="yearMean-value" x="' + (yearMeanCx - 57) + '" y="' + (55) + '">' + averages["1985 [YR1985]"].toFixed(2) + '</text>';
            yearMeanSvg += '<text id="yearMean-label" x="' + (yearMeanCx - 128) + '" y="' + (55) + '"> 1985 Mean -</text>';
            yearMeanSvg += "</svg>";

            console.log("yearMeanRadius: ", yearMeanRadius)

            // Add yearMean svg to container
            container.insertAdjacentHTML('afterbegin', yearMeanSvg);

            // Start the three circles svg string
            var svg = '<svg id="attribute-legend">';

            // Array of circle names to base loop on
            var circles = ["max", "mean", "min"];
            // Labels for each circle
            var labels = ["- Ethiopia, 1985", "- Mean, all years", "- Japan, 2020"]; // Custom labels

            // Loop to add each circle and text to a svg string
            for (var i = 0; i < circles.length; i++) {
                var radius = calcPropRadius(dataStats[circles[i]]);
                var cy = 60 - radius;

                // Circle string
                svg += '<circle class="legend-circle" id="' + circles[i] + '" r="' + radius + '" cy="' + cy + '" fill="#F47821" fill-opacity="0.8" stroke="#000000" cx="147"/>';

                // Evenly space out labels
                var textY = i * 14 + 30; // Adjusted for better spacing

                // Text string for values
                svg += '<text id="' + circles[i] + '-value" x="173" y="' + textY + '">' + Math.round(dataStats[circles[i]] * 100) / 100 + '</text>';
                // Text string for custom labels
                svg += '<text id="' + circles[i] + '-label" x="207" y="' + textY + '">' + labels[i] + '</text>';
            }

            // Close svg string
            svg += "</svg>";

            // Add attribute legend svg to container
            container.insertAdjacentHTML('beforeend', svg);

            container.insertAdjacentHTML('beforeend', "<small>births per 1,000 people annually<br>Data Source: worldbank.org</small>");

            return container;
        }
    });

    map.addControl(new LegendControl());
    console.log("Legend control added to the map.");
}


function updateLegend(attribute, averages) {
    //Update the label to include the year
    var year = attribute.match(/\d{4}/)[0];
    var yearMeanLabel = document.getElementById('yearMean-label');
    if (yearMeanLabel) {
        yearMeanLabel.textContent = year + " Mean -";
    };

    // Extract the year from the attribute
    var year = attribute.match(/\d{4}/)[0];
    // Update the legend text
    //document.querySelector("span.year").innerHTML = year;
    if (averages[attribute]) {
        var meanValue = averages[attribute].toFixed(2);
        
        document.getElementById('yearMean-value').textContent = meanValue; // Update the mean value for the year

        // Calculate the new radius for the yearMean circle
        var yearMeanRadius = calcYearMeanRadius(averages[attribute]);
        var yearMeanCircle = document.getElementById('yearMean');
        if (yearMeanCircle) {
            var fixedBottom = 70; // Fixed bottom position for the circle
            var yearMeanCy = fixedBottom - yearMeanRadius;
            yearMeanCircle.setAttribute('r', yearMeanRadius); // Update the radius
            yearMeanCircle.setAttribute('cy', yearMeanCy); // Update the cy position
        } else {
            console.error('Element with ID "yearMean" not found.');
        }
    } else {
        console.error(`Average value for ${attribute} not found.`);
    }
}


function calcYearMeanRadius(attValue) {
    // Use the same formula or adjust as needed
    var minRadius = minValue / 1.5;
    var radius = 1.3083 * Math.pow(attValue / minValue, 0.5715) * minRadius;
    return radius;
}


function updatePropSymbols(attribute) {
    map.eachLayer(function(layer) {
        if (layer.feature && layer.feature.properties[attribute]) {
            var props = layer.feature.properties;

            // Calculate the radius based on the attribute value
            var radius = calcPropRadius(props[attribute]);
            layer.setRadius(radius);

            // Determine the color based on the difference
            const country = props["Country Name"];
            const diff = differences[country][attribute];
            const color = useDifferenceColors ? (diff < 0 ? '#d01c8b' : '#4dac26') : '#e66101';
            layer.setStyle({ fillColor: color });

            // Create the popup content
            var popupContent = "<p><b>Country: </b>" + props["Country Name"] + "</p>";
            var year = attribute.match(/\d{4}/)[0]; // Extract the year from the attribute

            popupContent += "<p><b>Crude birth rate in " + year + ": </b>" + props[attribute] + "</p>";

            // Update the popup content
            var popup = layer.getPopup();            
            popup.setContent(popupContent).update();
        }
    })
};


/*  STEP 1: Calculate the average between the 16 countries for each year
    STEP 2: Find the difference between each country's value to that year's 
            average using index year
    STEP 3: Recolor the marker based on the difference on a pink to green scale
    STEP 4: Create a button that toggles between the default orange and the
            new difference colors
    STEP 5: Create a new legend that appears when the button is pushed showing
            the average and the new colors in the legend  */

function calculateAverages(data, years) {
    const averages = {};
    years.forEach(year => {
        let sum = 0;
        let count = 0;
        data.features.forEach(feature => {
            const value = feature.properties[year];
            if (!isNaN(value)) {
                sum += value;
                count++;
            }
        });
        averages[year] = sum / count;
    });
    console.log("averages: ", averages)
    return averages;
};

function calculateDifferences(data, averages, years) {
    const differences = {};
    data.features.forEach(feature => {
        const country = feature.properties["Country Name"];
        differences[country] = {};
        years.forEach(year => {
            const value = feature.properties[year];
            differences[country][year] = value - averages[year];
        });
    });
    console.log("differences: ", differences)
    return differences;
};


/*
function addToggleButton(map, differences, years) {
    // Create a new Leaflet control for the button
    var ToggleControl = L.Control.extend({
        options: {
            position: 'topright'
        },

        onAdd: function() {
            // Create the control container with a particular class name
            var container = L.DomUtil.create('div', 'leaflet-bar leaflet-control leaflet-control-custom');

            // Create the button element
            var button = L.DomUtil.create('button', '', container);
            button.innerHTML = 'Toggle Colors';
            button.style.backgroundColor = 'white';
            button.style.border = '2px solid gray';
            button.style.padding = '5px';

            // Add click event listener to the button
            button.onclick = function() {
                toggleColorScale(differences, years);
            };

            return container;
        }
    });

    // Add the new control to the map
    map.addControl(new ToggleControl());
};


function addToggleRadioButton(map, differences, years) {
    var ToggleControl = L.Control.extend({
        options: {
            position: 'topright'
        },

        onAdd: function() {
            var container = L.DomUtil.create('div', 'leaflet-bar leaflet-control leaflet-control-custom');

            // Create the radio button element
            var radioButton = L.DomUtil.create('input', '', container);
            radioButton.type = 'radio';
            radioButton.id = 'toggleRadioButton';
            radioButton.name = 'colorToggle';
            radioButton.style.margin = '5px';

            // Create the label for the radio button
            var label = L.DomUtil.create('label', '', container);
            label.htmlFor = 'toggleRadioButton';
            label.innerHTML = 'Toggle Colorz';
            label.style.margin = '5px';

            // Add change event listener to the radio button
            radioButton.onchange = function() {
                toggleColorScale(differences, years);
            };

            return container;
        }
    });

    map.addControl(new ToggleControl());
};
*/

function addToggleCheckbox(map, differences, years) {
    var ToggleControl = L.Control.extend({
        options: {
            position: 'topright'
        },

        onAdd: function() {
            var container = L.DomUtil.create('div', 'leaflet-bar leaflet-control leaflet-control-custom');

            // Create the checkbox element
            var checkbox = L.DomUtil.create('input', '', container);
            checkbox.type = 'checkbox';
            checkbox.id = 'toggleCheckbox';
            checkbox.style.margin = '5px';

            // Create the label for the checkbox
            var label = L.DomUtil.create('label', '', container);
            label.htmlFor = 'toggleCheckbox';
            label.innerHTML = 'Toggle Comparison Colors';
            label.style.margin = '5px';

            // Add change event listener to the checkbox
            checkbox.onchange = function() {
                toggleColorScale(differences, years);
            };

            return container;
        }
    });

    map.addControl(new ToggleControl());
}



function toggleColorScale(differences, years) {
    useDifferenceColors = !useDifferenceColors;
    const year = years[0]; // Use the first year for initial coloring

    map.eachLayer(function(layer) {
        if (layer.feature) {
            const country = layer.feature.properties["Country Name"];
            const diff = differences[country][year];
            const color = useDifferenceColors ? (diff < 0 ? '#d01c8b' : '#4dac26') : '#e66101';
            layer.setStyle({ fillColor: color });
        }
    });

    updateLegendColors()
};

function updateLegendColors() {
    const legendCircles = document.querySelectorAll('.legend-circle');
    legendCircles.forEach(circle => {
        const id = circle.id;
        let color;
        if (useDifferenceColors) {
            color = id === 'max' || id === 'mean' ? '#4dac26' : '#d01c8b';
        } else {
            color = '#e66101'; // Use 'none' to specify no fill color
        }
        // Specifically handle the yearMean circle
        if (id === 'yearMean') {
            color = 'none'; // Ensure no fill color for yearMean circle
        }
        circle.setAttribute('fill', color);
    });
}



//first event listener creates the map upon the page loading
document.addEventListener('DOMContentLoaded', createMap);