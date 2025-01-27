require('dotenv').config();

const express = require('express');
const cors = require('cors'); // Import cors
const { exec } = require('child_process');

const app = express();
const port = process.env.POST_PORT || 3004;
const host = process.env.HOST || 'localhost';

// Middleware to parse JSON request bodies
app.use(express.json());
app.use(cors()); // Enable CORS for all routes

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
