var map;
var minValue;

//step 1 create Leaflet map
function createMap(){
    map = L.map('map', {
        center: [0, 0],
        zoom: 2
    });

    //add base tilelayer
    L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© <a href="http://www.openstreetmap.org/copyright">OpenStreetMap contributors</a>'
    }).addTo(map);

    //call getData function
    getData(map);
};

function calculateMinValue(data){
    //create empty array to store all data values
    var allValues = [];
    //loop through each city
    for(var city of data.features){
        //loop through each year
        for(var year = 1985; year <= 2015; year+=5){
              //get population for current year
              var value = city.properties["Pop_"+ String(year)];
              //add value to array
              allValues.push(value);
        }
    }
    console.log("allValues array: " + allValues);
    //get minimum value of our array
    minValue = Math.min(...allValues); // Remove 'var' to update global minValue
    console.log("Minimum value: " + minValue);

    return minValue;
};

//calculate the radius of each proportional symbol
function calcPropRadius(attValue) {
    //constant factor adjusts symbol sizes evenly
    var minRadius = 5;
    //Flannery Apperance Compensation formula
    var radius = 1.0083 * Math.pow(attValue/minValue,0.5715) * minRadius

    return radius;
};

//function to convert markers to circle markers
function pointToLayer(feature, latlng, attributes){
    var attribute = attributes[0];

    //create marker options
    var options = {
        fillColor: "#ff7800",
        color: "#000",
        weight: 1,
        opacity: 1,
        fillOpacity: 0.8
    };

    //For each feature, determine its value for the selected attribute
    var attValue = Number(feature.properties[attribute]);

    //Give each feature's circle marker a radius based on its attribute value
    options.radius = calcPropRadius(attValue);

    //create circle marker layer
    var layer = L.circleMarker(latlng, options);

    //build popup content string
    var popupContent = "<p><b>City:</b> " + feature.properties.City + "</p>";
    
    //add formatted attribute to popup content string
    var year = attribute.split("_")[1];
    popupContent+= "<p><b>Population in " + year + ": </b>" + feature.properties[attribute] + " million</p>";

    //bind the popup to the circle marker
    layer.bindPopup(popupContent, {
        offset: new L.Point(0, -options.radius)
    });

    //return the circle marker to the L.geoJson pointToLayer option
    return layer;
};

//Add circle markers for point features to the map
function createPropSymbols(data, attributes){
    //create a Leaflet GeoJSON layer and add it to the map
    L.geoJson(data, {
        pointToLayer: function(feature, latlng){
            return pointToLayer(feature, latlng, attributes);
        }
    }).addTo(map);
};

function createSequenceControls(attributes){
    //create range input element (slider)
    var slider = "<input class='range-slider' type='range'></input>";
    document.querySelector("#panel").insertAdjacentHTML('beforeend',slider);

    //create sequence step buttons
    document.querySelector('#panel').insertAdjacentHTML('beforeend','<button class="step" id="reverse">Reverse</button>');
    document.querySelector('#panel').insertAdjacentHTML('beforeend','<button class="step" id="forward">Forward</button>');

    document.querySelector('#reverse').insertAdjacentHTML('beforeend',"<img src='img/noun-left-arrow-4163466.png'>")
    document.querySelector('#forward').insertAdjacentHTML('beforeend',"<img src='img/noun-right-arrow-4163821.png'>")



    //set slider attributes
    document.querySelector(".range-slider").max = 6;
    //document.querySelector(".range-slider").min = 0;  This is unnecessary
    document.querySelector(".range-slider").value = 0;
    document.querySelector(".range-slider").step = 1;

    //Step 5: input listener for slider
    document.querySelector('.range-slider').addEventListener('input', function(){
        var index = this.value;
        console.log("Slider moved to index position: " + index);
        updatePropSymbols(attributes[index]);
    });

    //Step 5: click listener for buttons, the buttons were given the class "step"
    document.querySelectorAll('.step').forEach(function(step){
        step.addEventListener("click", function(){
            //moves index based on slider value in case you already changed it with the slider.
            //will be at 0 if untouched, will be where you left slider if moved
            var index = document.querySelector('.range-slider').value;

            //Step 6: increment or decrement depending on button clicked
            if (step.id == 'forward'){
                index++;
                index = index > 6 ? 0 : index;
                console.log("Forward button clicked, new index: " + index);
            } else if (step.id == 'reverse'){
                index--;
                index = index < 0 ? 6 : index;
                console.log("Reverse button clicked, new index: " + index);
            };

            //Step 8: update slider
            document.querySelector('.range-slider').value = index;

            //Step 9: pass new attribute to update symbols
            updatePropSymbols(attributes[index]);
        });
    });
};

function updatePropSymbols(attribute){
    // Iterate over each layer on the map
    map.eachLayer(function(layer){
        // Check if the layer has a feature and the specified attribute
        if (layer.feature && layer.feature.properties[attribute]){
            var props = layer.feature.properties;

            // Calculate the radius based on the attribute value
            var radius = calcPropRadius(props[attribute]);
            layer.setRadius(radius);

            // Create the popup content
            var popupContent = "<p><b>City:</b> " + props.City + "</p>";
            var year = attribute.split("_")[1];
            popupContent += "<p><b>Population in " + year + ":</b> " + props[attribute] + " million</p>";

            // Update the popup content
            var popup = layer.getPopup();            
            popup.setContent(popupContent).update();
        };
    });
};


//creates an array of the years in the json for sequencing through
function processData(data) {
    var attributes = [];
    var properties = data.features[0].properties;

    for (var attribute in properties) {
        if (attribute.indexOf("Pop") > -1){
            attributes.push(attribute);
        };
    };

    return attributes;
};

function getData(){
    fetch("data/MegaCities.geojson")
        .then(function(response){
            return response.json();
        })
        .then(function(json){
            var attributes = processData(json);
            minValue = calculateMinValue(json);
            createPropSymbols(json, attributes);
            createSequenceControls(attributes);
        })
};
document.addEventListener('DOMContentLoaded',createMap);
