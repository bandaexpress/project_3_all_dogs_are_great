from flask import Flask, request, jsonify, render_template
import requests

# Initialize Flask.
app = Flask(__name__)

# Define API base URL.
api_base_url = 'https://api.api-ninjas.com/v1/dogs?name={}'

# Define routing for the index page.
@app.route('/', methods=['GET', 'POST'])
def index():
    if request.method == 'POST':
        # Get breed name from the form submitted by the user.
        name = request.form['name']
        
        # Construct API URL for the specified breed.
        api_url = api_base_url.format(name)
        
        # Make API call to fetch data for the specified breed.
        response = requests.get(api_url, headers={'X-Api-Key': '9LkCcmGFh3C8Pz6B1PR1CA==QJngCyg1iIL7vtaz'})
        
        # Check if the request was successful.
        if response.status_code == requests.codes.ok:
            breed_data = response.json()
            return jsonify(breed_data)
        else:
            return 'Error: Unable to fetch data for the specified breed.'
    else:
        # Render the index.html template.
        return render_template('./index.html')

# Run the Flask app (127.0.0.1:5000 by default).
if __name__ == '__main__':
    app.run(debug=True)
