require('dotenv').config(); // Load environment variables from .env

const express = require('express');
const cors = require('cors'); // Import cors
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const { json } = require('stream/consumers');

const app = express();
const port = process.env.PORT; // Using .env for port if available
const host = process.env.HOST; // Default to localhost if HOST is not set

// Middleware to parse JSON request bodies
app.use(express.json());
app.use(cors(
    {
       origin:"http://localhost:3000",
       methods: ["GET", "POST", "PATCH", "DELETE"],
    }
)); // Enable CORS for all routes

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

// Initial load of data
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



// Endpoint to execute the reboot command
app.post('/api/v1/igateRE/nodeStatus/device', (req, res) => {
    const deviceName = req.body.device_name;  // Expecting device name in POST body

    // Check if device_name is provided
    if (!deviceName) {
        return res.status(400).send('Device name is required');
    }

    // Sanitize or validate the deviceName if necessary to avoid security risks
    const command = `./eden controller edge-node reboot --config ${deviceName}`;
    console.log("this is a post command", command);

    // Execute the reboot command
    exec(command, (error, stdout, stderr) => {
        if (error) {
            console.error(`Error executing command: ${error.message}`);
            return res.status(500).send(`Error rebooting device: ${stderr}`);
        }

        console.log(`Command executed successfully: ${stdout}`);
        res.send(`Device ${deviceName} rebooted successfully!`);
    });
});

// Start the server
app.listen(port, host, () => {
    console.log(`Server running at http://${host}:${port}`);
});
