require('dotenv').config(); // Load environment variables from .env

const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
const port = process.env.PORT || 3005; // Using .env for port if available
const host = process.env.HOST || 'localhost'; // Default to localhost if HOST is not set

let cachedData = null;

// Function to load the JSON file
function loadData() {
    const dataFilePath = path.join(__dirname, 'all_devices.json'); // Ensure this path is correct
  
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
setInterval(loadData, 5 * 60 * 1000); // Reload every 5 minutes

// Route to get data for a specific device_name
app.get('/api/v1/igateRE/nodeStatus/', (req, res) => {
    const { device_name } = req.query; // Get device_name from query parameters

    if (device_name) {
        // If device_name is provided, filter the data
        if (cachedData) {
            const deviceData = cachedData.filter(device => device.device_name === device_name);
            if (deviceData.length > 0) {
                return res.status(200).json(deviceData); // 200 OK with filtered data
            } else {
                return res.status(404).send('Device not found'); // 404 Not Found
            }
        } else {
            return res.status(500).send('Data not available'); // 500 Internal Server Error
        }
    } else {
        // If no device_name is provided, return all data
        if (cachedData) {
            return res.status(200).json(cachedData); // 200 OK with all data
        } else {
            return res.status(500).send('Data not available'); // 500 Internal Server Error
        }
    }
});

app.listen(port, host, () => {
    console.log(`Server running at http://${host}:${port}`);
});
