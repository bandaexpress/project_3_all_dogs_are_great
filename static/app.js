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

// Function to plot the distribution of dominant traits
function plotDominantTraits(sortedDominantTraits) {
  const dominantTraitsChartDiv = document.getElementById('dominantTraitsChart');
  const dominantTraitsData = [{
    x: Object.keys(sortedDominantTraits),
    y: Object.values(sortedDominantTraits),
    type: 'bar',
    marker: {
      color: 'skyblue'
    }
  }];
  const dominantTraitsLayout = {
    title: 'Distribution of Dominant Traits Among Breeds',
    xaxis: {
      tickangle: -45
    }
  };
  Plotly.newPlot('dominantTraitsChart', dominantTraitsData, dominantTraitsLayout);
}

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

// Load the JSON data from the file
fetch('./static/dog_data.json')
  .then(response => response.json())
  .then(data => {
    // Store the data in the global variable
    window.data = data;

    // Call the function to populate the dropdown with the loaded data
    populateDropdown(data);

    // Populate the dictionary
    const firstTemperamentGroups = {};
    data.forEach(dog => {
      const name = dog.name;
      const temperaments = dog.temperament;
      if (typeof temperaments === 'string') {
        const firstTemperament = temperaments.split(",")[0].trim();
        if (!(firstTemperament in firstTemperamentGroups)) {
          firstTemperamentGroups[firstTemperament] = [name];
        } else {
          firstTemperamentGroups[firstTemperament].push(name);
        }
      }
    });

    // Calculate the count of breeds for each dominant trait
    const dominantTraitCounts = {};
    Object.entries(firstTemperamentGroups).forEach(([temperament, breeds]) => {
      if (breeds.length >= 5) {
        dominantTraitCounts[temperament] = breeds.length;
      }
    });

    // Sort the dominant traits based on their counts
    const sortedDominantTraits = Object.fromEntries(
      Object.entries(dominantTraitCounts)
        .sort(([,a],[,b]) => b - a)
    );

    // Plot the distribution of dominant traits
    plotDominantTraits(sortedDominantTraits);

    // Create a height/weight scatter plot
    createScatterPlot(data);
  })
  .catch(error => {
    console.error('Error loading the JSON file:', error);
  });

// Function to create a radar chart for a selected breed
function createRadarChart(selectedBreedId) {
  var ctx = document.getElementById('radarChart').getContext('2d');

  // Find the selected breed in the data using the ID
  var breed = window.data.find(b => b.id === selectedBreedId);

  // Check if the breed is found
  if (breed) {
    // Extract specific attributes for the radar chart
    var attributes = Object.keys(breed).filter(key => key !== 'id' && key !== 'name');

    // Calculate a score for each attribute based on its value
    var scores = attributes.map(key => {
      // Arbitrary scale of 1-10, adjust as needed
      return breed[key] ? Math.floor(Math.random() * 10) + 1 : 0;
    });

    // Create the radar chart
    new Chart(ctx, {
      type: 'radar',
      data: {
        labels: attributes,
        datasets: [{
          label: breed.name,
          data: scores,
          backgroundColor: 'rgba(255, 99, 132, 0.5)',
          borderColor: 'rgba(255, 99, 132, 1)',
          borderWidth: 1
        }]
      },
      options: {
        scales: {
          r: {
            beginAtZero: true,
            max: 10 // Maximum score in the scale
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
