// Declare data variable
let data;

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
  .then(receivedData => {
    // Assign the data variable
    data = receivedData;

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
          text: name,
          radius: 4
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
              return context.dataset.data[context.dataIndex].text;
            }
          }
        }
      }
    }
  });
}

// Function to create a radar chart for a selected breed
function createRadarChart(selectedBreedId) {
  var ctx = document.getElementById('radarChart').getContext('2d');

  // Find the selected breed in the data using the ID
  var breed = data.find(b => b.id === selectedBreedId);

  // Check if the breed is found
  if (breed) {
    // Extract specific attributes for the radar chart
    var attributes = ['height', 'weight', 'life_span', 'temperament', 'bred_for'];
    var attributeValues = attributes.map(key => breed[key]);

    // Create the radar chart
    new Chart(ctx, {
      type: 'radar',
      data: {
        labels: attributes,
        datasets: [{
          label: breed.name,
          data: attributeValues.map(value => isNaN(value) ? 5 : value), // Replace non-numeric values with a default
          backgroundColor: 'rgba(255, 99, 132, 0.5)',
          borderColor: 'rgba(255, 99, 132, 1)',
          borderWidth: 1
        }]
      },
      options: {
        scales: {
          r: {
            beginAtZero: true
          }
        }
      }
    });
  } else {
    // Breed not found, handle this case (e.g., show an error message)
    console.error('Selected breed not found:', selectedBreedId);
  }
}


// Function to handle dropdown selection change
function onBreedSelectChange() {
  var selectedBreedId = parseInt(document.getElementById('breedsDropdown').value);

  // Clear previous radar chart if exists
  var existingChart = Chart.getChart('radarChart');
  if (existingChart) {
    existingChart.destroy();
  }

  // Create a new radar chart for the selected breed
  createRadarChart(selectedBreedId);
}

// Attach the onBreedSelectChange function to the change event of the dropdown
document.getElementById('breedsDropdown').addEventListener('change', onBreedSelectChange);
