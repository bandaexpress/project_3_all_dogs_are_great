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

  

  // Function to create a breed card for the selected breed
  function createBreedCard(breed) {
    const breedCard = document.createElement('div');
    breedCard.classList.add('breed-card');

    // Dynamically generate the image URL using reference_image_id
    const imageUrl = `https://cdn2.thedogapi.com/images/${breed.reference_image_id}.jpg`;

    breedCard.innerHTML = `
      <img src="${imageUrl}" alt="${breed.name}">
      <h2>${breed.name}</h2>
      <p><strong>Bred For:</strong> ${breed.bred_for}</p>
      <p><strong>Temperament:</strong> ${breed.temperament}</p>
      <p><strong>Life Span:</strong> ${breed.life_span}</p>
    `;

    return breedCard;
  }

  // Function to handle dropdown selection change
  function onBreedSelectChange() {
    var selectedBreedId = parseInt(document.getElementById('breedsDropdown').value);

    // Find the selected breed in the data using the ID
    var selectedBreed = data.find(breed => breed.id === selectedBreedId);

    // Clear previous breed card if exists
    var existingBreedCard = document.getElementById('breedCard');
    if (existingBreedCard) {
      existingBreedCard.remove();
    }

    // Check if the selected breed is found
    if (selectedBreed) {
      // Create a breed card for the selected breed
      var breedCard = createBreedCard(selectedBreed);
      breedCard.id = 'breedCard'; // Set id for the breed card
      var breedsContainer = document.getElementById('breeds-container');
      breedsContainer.appendChild(breedCard);
    } else {
      console.error('Selected breed not found:', selectedBreedId);
    }
  }

  // Attach the onBreedSelectChange function to the change event of the dropdown
  document.getElementById('breedsDropdown').addEventListener('change', onBreedSelectChange);

  // Function to fetch dog breeds based on shedding level
function fetchDogBreeds(sheddingLevel) {
  const api_url = `https://api.api-ninjas.com/v1/dogs?shedding=${sheddingLevel}`;
  const apiKey = '9LkCcmGFh3C8Pz6B1PR1CA==QJngCyg1iIL7vtaz';

  fetch(api_url, {
      headers: {
        'X-Api-Key': apiKey
      }
    })
    .then(response => {
      if (response.ok) {
        return response.json();
      } else {
        throw new Error(`Error: ${response.status}`);
      }
    })
    .then(data => {
      // Display the fetched dog breeds
      displayDogBreeds(data);
    })
    .catch(error => {
      console.error(error);
    });
}

// Function to display dog breeds on the webpage
function displayDogBreeds(data) {
  const breedsContainer = document.getElementById('breeds-container');
  breedsContainer.innerHTML = ''; // Clear previous content
  
  // Iterate over each dog breed in the fetched data
  data.forEach(breed => {
    // Create a div element to hold the breed information
    const breedDiv = document.createElement('div');
    breedDiv.classList.add('breed');

    // Create an img element for the breed image
    const breedImage = document.createElement('img');
    breedImage.src = breed.image_link;
    breedImage.alt = breed.name;
    breedDiv.appendChild(breedImage);

    // Create a paragraph element for breed details
    const breedDetails = document.createElement('p');
    breedDetails.textContent = `Name: ${breed.name}, Good with children: ${breed.good_with_children}, Shedding: ${breed.shedding}, Grooming: ${breed.grooming}, Drooling: ${breed.drooling}`;
    breedDiv.appendChild(breedDetails);

    // Append the breed div to the container
    breedsContainer.appendChild(breedDiv);
  });
}

// Add click event listeners to each shedding button
const sheddingButtons = document.querySelectorAll('.sheddingButton');
sheddingButtons.forEach(button => {
  button.addEventListener('click', () => {
    const sheddingLevel = button.getAttribute('data-shedding');
    fetchDogBreeds(sheddingLevel);
  });

  // Function to plot the distribution of dominant traits
function plotDominantTraits(data) {
  // Collect all traits from all breeds into a single array
  const allTraits = [];
  data.forEach(breed => {
      const temperament = breed.temperament;
      if (temperament) {
          const traits = temperament.split(',').map(t => t.trim());
          allTraits.push(...traits);
      }
  });

  // Count the occurrences of each trait
  const traitCounts = {};
  allTraits.forEach(trait => {
      traitCounts[trait] = (traitCounts[trait] || 0) + 1;
  });

  // Convert the counts into an array of objects for sorting
  const traitEntries = Object.entries(traitCounts);

  // Sort the traits based on their counts
  traitEntries.sort((a, b) => b[1] - a[1]);

     // Select the top traits to display in the chart
    const topTraits = traitEntries.slice(0, 25); // Limiting to top 10

    const traitKeys = topTraits.map(entry => entry[0]);
    const traitValues = topTraits.map(entry => entry[1]);
    const breedLists = topTraits.map(entry => {
        const trait = entry[0];
        const breedList = data.filter(breed => breed.temperament && breed.temperament.includes(trait)).map(breed => breed.name);
        const limitedBreedList = breedList.slice(0, 25);
        return limitedBreedList.join('<br>'); // Convert breed list to HTML format for Plotly tooltip
        return breedList.join('<br>');
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
