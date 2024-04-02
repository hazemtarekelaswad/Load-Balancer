import config from './config.json';
import express from 'express';
import axios from 'axios';
import {
    algorithmType,
    instanceLeastConnectionsType,
    instanceRoundRobinType,
    instanceWeightedRoundRobinType,
} from './constants';


const createLoadBalancerWithRoundRobin = (instances: instanceRoundRobinType[]) => {
    const app = express();
    app.use(express.json());

    let counter = 0;
    app.all('*', async (req, res) => {
        const url = `http://${config.serverHost}:${instances[counter].port}${req.url}`;
        counter = (counter + 1) % config.instancesCount;
        try {
            const response = await axios({
                url: url,
                data: req.body,
                method: req.method,
                headers: req.headers
            });

            res.status(response.status).send(response.data);
        } catch (error: any) {
            error.response
                ? res.status(error.response.status).send(error.response.data)
                : res.status(500).send('Internal Server Error');
        }
    });

    return app;
}

const createLoadBalancerWithWeightedRoundRobin = (instances: instanceWeightedRoundRobinType[]) => {
    const app = express();
    app.use(express.json());

    let counter = 0;
    let weight = config.weights[counter];
    app.all('*', async (req, res) => {
        try {
            const url = `http://${config.serverHost}:${instances[counter].port}${req.url}`;

            --weight;
            if (weight === 0) {
                counter = (counter + 1) % config.instancesCount;
                weight = config.weights[counter];
            }

            const response = await axios({
                url: url,
                data: req.body,
                method: req.method,
                headers: req.headers
            });

            res.status(response.status).send(response.data);
        } catch (error: any) {
            error.response
                ? res.status(error.response.status).send(error.response.data)
                : res.status(500).send('Internal Server Error');
        }
    });

    return app;
}

// const createLoadBalancerWithLeastConnections = (instances: instanceLeastConnectionsType[]) => {
//     const app = express();
//     app.use(express.json());

//     app.all('*', async (req, res) => {
//         const targetInstance = instances.reduce((prev, curr) => 
//         prev.connectionsCount < curr.connectionsCount ? prev : curr);
        
//         console.log(targetInstance);
//         ++targetInstance.connectionsCount;

//         const url = `http://${config.serverHost}:${targetInstance.port}${req.url}`;
//         try {
//             const response = await axios({
//                 url: url,
//                 data: req.body,
//                 method: req.method,
//                 headers: req.headers
//             });
            
//             res.status(response.status).send(response.data);
//         } catch (error: any) {
//             error.response
//                 ? res.status(error.response.status).send(error.response.data)
//                 : res.status(500).send('Internal Server Error');
//         }
//         res.on('finish', () => --targetInstance.connectionsCount);

//     });
//     return app;
// }


const createLoadBalancer = (algo: algorithmType, instances: any) => {
    switch (algo) {
        case 'roundRobin': return createLoadBalancerWithRoundRobin(instances);
        case 'weightedRoundRobin': return createLoadBalancerWithWeightedRoundRobin(instances);
        // case 'leastConnections': return createLoadBalancerWithLeastConnections(instances);
        default: throw new Error('Undefined load balancer distribution algorithm');
    };
}

export default createLoadBalancer;