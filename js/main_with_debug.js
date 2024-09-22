/**
 * File: main_with_debug.js
 * Author: Justin Sena
 * Date: 2024-09-14
 * For Geog 575 at University of Wisconsin Madison, Fall 2024
 */

//Initialize function to call the other functions of this prograam.
function initialize() {
    createCitiesTable();
	addColumns(cityPop);
	addEvents();
}

//Create array that contains the city population objects to fill the table with.
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

//Function creates the HTML table and fills it with the objects of the cityPop array.
function createCitiesTable() {
   
    // Variable that contains the function to create a table HTML element
	//the element type changes with each call
    var table = document.createElement("table");

    // Variable that contains the function to create header row elements <tr>
    var headerRow = document.createElement("tr");

    /*call the headerRow variable function and use the insertAdjacentHTml method to 
	add "City" and "Population" as header elements at the end, aka "beforeend" */
    headerRow.insertAdjacentHTML("beforeend","<th>City</th><th>Population</th>");

	// call table function and append the header row html using the headerRow variable
    table.appendChild(headerRow);

    //loop to add a new row for each element in the cityPop array.
    for(var i = 0; i < cityPop.length; i++){

        /*assign to variable rowHtml the HTML code needed to populate each row of the HTML table with the 
		cities and their populations from the cityPop array for the current iteration. */
        var rowHtml = "<tr><td>" + cityPop[i].city + "</td><td>" + cityPop[i].population + "</td></tr>";

        /*call the table function to add the new HTML code and contents to create a new row at the end of 
		the table*/
        table.insertAdjacentHTML('beforeend',rowHtml);
    };

	//assign variable an element selector to search for elements with ID "mydiv"
	var myDiv = document.querySelector("#mydiv");

	//call myDiv to then add the table to that element.
    myDiv.appendChild(table);
}



/*The addColumns function takes an array of city population objects (cityPop) and adds a new 
column to a table, indicating the size of each city based on its population. */

function addColumns(cityPop) {

    // Select all elements with the <tr> tag and iterate through each.
    document.querySelectorAll("tr").forEach(function(row, i) {
        // Check if the iteration is on the first row.
        if (i == 0) {

			//if it is the first row, add the header "City Size" at the end of the row
            row.insertAdjacentHTML('beforeend', '<th>City Size</th>');

			/*otherwise run through the following cityPop objects, comparing them to particular values
			and assigning the string for their population size to a variable citySize.*/
        } else {
            var citySize;

            if (cityPop[i - 1].population < 100000) {
                citySize = 'Small';
            } else if (cityPop[i - 1].population < 500000) {
                citySize = 'Medium';
            } else {
                citySize = 'Large';
            }

            // Adds a new cell <td> with the city size string to the end of the row.
            row.insertAdjacentHTML('beforeend', '<td>' + citySize + '</td>');
        }
    });
}


/*Function to add event Listener that generates a random color to the text upon hovering as well as a 
   click me alert */
function addEvents() {
	//Search for table element and add event listener mouse over aka hover.
    document.querySelector("table").addEventListener("mouseover", function() {
        var color = "rgb(";

		//using the math object built-in functions, create a random RGB value to assign to the color variable
        for (var i = 0; i < 3; i++) {
            var random = Math.round(Math.random() * 255);
            color += random;

            if (i < 2) {
                color += ",";
            } else {
                color += ")";
            }
        }

		//assign the randomly generated color tot he table element.
        document.querySelector("table").style.color = color;
    });

	//function adds an event listener for clicking table elements and posting the string to an alert
    function clickme() {
        alert('Hey, you clicked me!');
    }
    //calls the clickme function
    document.querySelector("table").addEventListener("click", clickme);
}

//runs the intialize function to the window upon loading
window.onload = initialize();