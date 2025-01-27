const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const port = 3005;


let cachedData = null;

// Function to load the JSON file every 5 minutes
function loadData() {
    const dataFilePath = path.join(__dirname, 'eden_pods.json');
  
  fs.readFile(dataFilePath, 'utf8', (err, data) => {
    if (err) {
      console.error('Error reading file:', err);
    } else {
      try {
        cachedData = JSON.parse(data);
        console.log('Data loaded at', new Date().toLocaleTimeString());
      } catch (err) {
        console.error('Error parsing JSON:', err);
      }
    }
  });
}

// Initial load
loadData();

// Reload the file every 5 minutes
setInterval(loadData, 5 * 60 * 1000);  // 5 minutes in milliseconds

// Route to get the cached JSON data
app.get('/api/v1/igateRE/nodeStatus/', (req, res) => {
  if (cachedData) {
    res.json(cachedData);
  } else {
    res.status(500).send('Data not available');
  }
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});

