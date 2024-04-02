import childProcess from 'child_process';
import config from './config.json';
import {
    algorithmType,
    instanceLeastConnectionsType,
    instanceRoundRobinType,
    instanceWeightedRoundRobinType,
} from './constants';
import createLoadBalancer from './loadBalancerFactory';

/// Create Server Instances
let instances:
    instanceLeastConnectionsType[]
    | instanceRoundRobinType[]
    | instanceWeightedRoundRobinType[] = [];
for (
    let port = config.serverInitialPort;
    port < config.serverInitialPort + config.instancesCount;
    ++port
) {
    // Fork instances
    const server = childProcess.fork(config.serverPath);

    // Assign port and host to each instance
    server.send({
        'host': config.serverHost,
        'port': port,
        // 'timeout': Math.round(Math.random() * (10000 - 3000) + 3000)

    });

    // On exit, re-fork with the same port (for high availability purposes)
    server.on('exit', () => {
        console.log(`[Kill] Process ID ${server.pid} \t PORT: ${port}`);
        childProcess.fork(config.serverPath).send({
            'host': config.serverHost,
            'port': port,
            // 'timeout': Math.round(Math.random() * (10000 - 3000) + 3000)

        });
    });

    switch (config.algorithm as algorithmType) {
        case 'roundRobin':
            (instances as instanceRoundRobinType[]).push({ port: port });
            break;
        case 'weightedRoundRobin':
            (instances as instanceWeightedRoundRobinType[]).push({
                port: port,
                weight: config.weights[port - config.serverInitialPort],
            });
            break;
        case 'leastConnections':
            (instances as instanceLeastConnectionsType[]).push({
                port: port,
                connectionsCount: 0
            });
            break;
        default: throw new Error('Undefined load balancer distribution algorithm');

    }

}

try {
    const server = createLoadBalancer(config.algorithm as algorithmType, instances);
    server!.listen(config.loadBalancerPort, config.loadBalancerHost, () => {
        console.log(`Load balancer PID: ${process.pid}`);
    });
} catch (error) {
    console.error(error);
    process.exit();
}     