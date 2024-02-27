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
  fetch('/static/dog_data.json')
    .then(response => response.json())
    .then(data => {
      // Call the function to populate the dropdown with the loaded data
      populateDropdown(data);
    })
    .catch(error => {
      console.error('Error loading the JSON file:', error);
    });
  