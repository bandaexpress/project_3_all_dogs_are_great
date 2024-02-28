//Sourced from: The Dog API https://thedogapi.com
// json with dog breed info https://api.thedogapi.com/v1/breeds/

// Function to populate the dropdown with breed names
function populateDropdown(data) {
  var dropdown = document.getElementById("breedsDropdown");
  data.forEach(function(breed) {
      var option = document.createElement("option");
      option.text = breed.name;
      option.value = breed.id;
      dropdown.add(option);
  });
}

// Load the JSON data from the file
fetch('./static/dog_data.json')
  .then(response => response.json())
  .then(data => {
      // Call the function to populate the dropdown with the loaded data
      populateDropdown(data);

      // Create a height/weight scatter plot
      createScatterPlot(data);
  })
  .catch(error => {
      console.error('Error loading the JSON file:', error);
  });

// Function to create a height/weight scatter plot
function createScatterPlot(data) {
  var ctx = document.getElementById('scatterPlot').getContext('2d');

  // Extract breed names, height, and weight data
  var breedNames = data.map(breed => breed.name);
  var heightData = data.map(breed => parseFloat(breed.height.metric));
  var weightData = data.map(breed => parseFloat(breed.weight.metric));

  // Create the scatter plot
  new Chart(ctx, {
    type: 'scatter',
    data: {
      datasets: [{
        label: 'Height/Weight Scatter Plot',
        data: breedNames.map((name, index) => ({
          x: heightData[index],
          y: weightData[index],
          text: name, // Breed name for the tooltip
          radius: 4 // Adjust the size of the bubbles
        })),
        backgroundColor: 'rgba(75, 192, 192, 0.5)',
      }]
    },
    options: {
      scales: {
        x: {
          type: 'linear',
          position: 'bottom',
          title: {
            display: true,
            text: 'Height (cm)'
          }
        },
        y: {
          type: 'linear',
          position: 'left',
          title: {
            display: true,
            text: 'Weight (kg)'
          }
        }
      },
      plugins: {
        tooltip: {
          callbacks: {
            label: function (context) {
              return context.dataset.data[context.dataIndex].text; // Show breed name in tooltip
            }
          }
        }
      }
    }
  });
}

