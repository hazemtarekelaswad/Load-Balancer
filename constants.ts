type algorithmType = 'roundRobin' | 'weightedRoundRobin' | 'leastConnections';

type instanceRoundRobinType = {
    port: number,
}

type instanceWeightedRoundRobinType = {
    port: number;
    weight: number,
}

type instanceLeastConnectionsType = {
    port: number;
    connectionsCount: number
}


export { 
    algorithmType, 
    instanceRoundRobinType,
    instanceWeightedRoundRobinType,
    instanceLeastConnectionsType,
};