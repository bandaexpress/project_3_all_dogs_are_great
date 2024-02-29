// Declare data variable
let data;
let firstTemperamentGroups = {}; // Modified to store first temperament groups

// Function to populate the dropdown with breed names
function populateDropdown(data) {
    var dropdown = document.getElementById("breedsDropdown");
    data.forEach(function (breed) {
        var option = document.createElement("option");
        option.text = breed.name;
        option.value = breed.id;
        dropdown.add(option);
    });
}

// Function to handle trait selection
function onTraitSelectChange() {
    const selectedTrait = document.getElementById('traitDropdown').value;
}

// Function to plot the distribution of dominant traits
function plotDominantTraits(sortedDominantTraits) {
    const dominantTraitsChartDiv = document.getElementById('dominantTraitsChart');
    const traitKeys = Object.keys(sortedDominantTraits);
    const traitValues = Object.values(sortedDominantTraits);

    // Extract breed list information for each trait
    const breedLists = traitKeys.map(trait => {
        const breedList = firstTemperamentGroups[trait] || [];
        return breedList.join('<br>'); // Convert breed list to HTML format for Plotly tooltip
    });

    const dominantTraitsData = [{
        x: traitKeys,
        y: traitValues,
        type: 'bar',
        marker: {
            color: 'skyblue'
        },
        text: breedLists, // Assign breed lists as text for each bar
        hoverinfo: 'text+y' // Show breed lists and y values when hovering over bars
    }];

    const dominantTraitsLayout = {
        title: 'Distribution of Dominant Traits Among Breeds',
        xaxis: {
            tickangle: -45
        },
        yaxis: {
            title: 'Count'
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

// Load the JSON data from the file
fetch('./static/dog_data.json')
    .then(response => response.json())
    .then(data => {
        // Store the data in the global variable
        window.data = data;

        // Call the function to populate the dropdown with the loaded data
        populateDropdown(data);

        // Populate the first temperament groups dictionary
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
                .sort(([, a], [, b]) => b - a)
        );

        // Plot the distribution of dominant traits
        plotDominantTraits(sortedDominantTraits);

        // Create a height/weight scatter plot
        createScatterPlot(data);
    })
    .catch(error => {
        console.error('Error loading the JSON file:', error);
    });

// Attach the onBreedSelectChange function to the change event of the dropdown
document.getElementById('breedsDropdown').addEventListener('change', onBreedSelectChange);

// Attach the onTraitSelectChange function to the change event of the trait dropdown
document.getElementById('traitDropdown').addEventListener('change', onTraitSelectChange);

// Function to populate dropdowns with unique temperaments
function populateTemperamentDropdowns(data) {
  const allTemperaments = new Set();
  // Extract unique temperaments from the data
  data.forEach(breed => {
      const temperament = breed.temperament;
      if (temperament) {
          const temperaments = temperament.split(',').map(t => t.trim());
          temperaments.forEach(t => allTemperaments.add(t));
      }
  });
  // Convert set to array and sort alphabetically
  const sortedTemperaments = Array.from(allTemperaments).sort();
  
  // Populate dropdowns with sorted temperaments
  const dropdown1 = document.getElementById('temperament1');
  const dropdown2 = document.getElementById('temperament2');
  sortedTemperaments.forEach(temperament => {
      const option1 = document.createElement('option');
      option1.text = temperament;
      option1.value = temperament;
      dropdown1.add(option1);
      const option2 = document.createElement('option');
      option2.text = temperament;
      option2.value = temperament;
      dropdown2.add(option2);
  });
}

// Fetch JSON data and populate dropdowns
fetch('./static/dog_data.json')
    .then(response => response.json())
    .then(data => {
        populateTemperamentDropdowns(data);
    })
    .catch(error => {
        console.error('Error loading the JSON file:', error);
    });

// Function to display matching breeds
function displayMatchingBreeds(breeds) {
    const list = document.getElementById('matchingBreeds');
    list.innerHTML = ''; // Clear previous results
    if (breeds.length === 0) {
        // If no matches found, display a message
        const listItem = document.createElement('li');
        listItem.textContent = 'No matches found';
        list.appendChild(listItem);
        return;
    }
    breeds.forEach(breed => {
        const listItem = document.createElement('li');
        listItem.textContent = breed.name;
        list.appendChild(listItem);
    });
}

// Function to filter dog breeds by temperament characteristics
function filterBreedsByTemperament() {
    // Get user input for temperament characteristics
    const temperament1 = document.getElementById('temperament1').value.trim().toLowerCase();
    const temperament2 = document.getElementById('temperament2').value.trim().toLowerCase();
    // Check if temperaments are empty
    if (!temperament1 || !temperament2) {
        console.error('Please select both temperaments.');
        return;
    }
    // Filter breeds that match both temperament characteristics
    const matchingBreeds = window.data.filter(breed => {
        if (breed.temperament) {
            const temperaments = breed.temperament.toLowerCase().split(',').map(t => t.trim());
            return temperaments.includes(temperament1) && temperaments.includes(temperament2);
        }
        return false; // Return false if temperament is undefined
    });
    // Sort matching breeds alphabetically by name
    matchingBreeds.sort((a, b) => (a.name > b.name) ? 1 : -1);
    // Display the top 5 matching breeds
    displayMatchingBreeds(matchingBreeds.slice(0, 5));
}
