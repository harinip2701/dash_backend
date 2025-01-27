require('dotenv').config(); // Load environment variables from .env

const express = require('express');
const users = require("./all_devices.json");
const cors = require('cors'); // Import cors
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');


const app = express();
const port = process.env.PORT; // Using .env for port if available
const host = process.env.HOST; // Default to localhost if HOST is not set

// Middleware to parse JSON request bodies
app.use(express.json());
app.use(cors(
    {
       //origin:"http://localhost:3000",
       methods:["GET", "POST", "PATCH", "DELETE"],
    }
));


app.get('/api/v1/igateRE/nodeStatus/', (req, res) => {
   
   
    return res.json(users);
});

app.delete('/api/v1/igateRE/nodeStatus/:device_name', async (req, res) => {
    try {
        const { device_name } = req.params;
        const filteredUsers = users.filter((user)=>user.device_name!==device_name);
        // Logic to delete the device
        fs.writeFile("./all_devices.json", JSON.stringify(filteredUsers),(err,data)=>{
         return res.json(filteredUsers);    
        });
        
    } catch (error) {
        console.error("Error deleting device:", error);
        res.status(500).json({ error: "Internal Server Error" });
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