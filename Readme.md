# Load Balancer
## Description
A simple implementation of Layer 7 load balancer that distributes HTTP requests among instances (child processes) of backend servers.

In this project:
- **Multiprocessing** is used to represent the backend server instances.
- **HTTP** is used for the communication between Load balancer and the instances.
- **Round robin** and **Weighted round robin** are the distribution algorithms implemented and you can choose which one to use in `config.json`.
- **High availability** is attained by introducing a re-forking for every killed child process (intance).
---
### **`Config.json` example**
```json
{
    "instancesCount": 3,
    "serverPath": "./server.js",
    "loadBalancerHost": "localhost",
    "loadBalancerPort": 8000,
    "serverHost": "localhost",
    "serverInitialPort": 5000,
    "algorithm": "weightedRoundRobin",
    "weights": [2, 3, 1]
}
```
---
### To build and run
```bash
npm install
npm run loadbalancer
```