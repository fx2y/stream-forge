// Data replication
class Replication {
    constructor() {
        this.replicas = [];
        this.leader = null;
        this.messageQueue = [];
    }

    // Elects a leader among the replicas.
    async electLeader() {
        // Sort replicas by ID
        this.replicas.sort((a, b) => a.id - b.id);

        // Elect replica with the lowest ID as leader
        this.leader = this.replicas[0];

        // Notify all replicas of new leader
        await Promise.all(this.replicas.map(replica => replica.notifyLeader(this.leader)));

        // Start heartbeat loop
        setInterval(() => {
            if (this.leader) {
                this.replicas.forEach(replica => {
                    if (replica !== this.leader) {
                        this.sendHeartbeat(replica);
                    }
                });
            }
        }, 1000);

        // Subtask 3: Implement a protocol for the leader to send data to the followers and ensure they have received it.
        setInterval(() => {
            if (this.leader) {
                const message = this.messageQueue.shift();
                if (message) {
                    this.replicas.forEach(replica => {
                        if (replica !== this.leader) {
                            replica.receiveData(message);
                        }
                    });
                }
            }
        }, 100);
    }

    // Sends data to the leader for replication.
    async sendData(data) {
        this.messageQueue.push(data);
        await this.leader.replicateData(data);
    }

    // Removes a replica from the replication group.
    async removeReplica(replica) {
        const index = this.replicas.indexOf(replica);
        if (index !== -1) {
            this.replicas.splice(index, 1);
            if (this.leader === replica) {
                await this.electLeader();
            }
        }
    }

    // Sends a heartbeat to a replica to ensure it is still alive.
    async sendHeartbeat(replica) {
        try {
            await replica.checkHeartbeat();
        } catch (error) {
            console.error(`Failed to send heartbeat to replica ${replica.id}: ${error.message}`);
            await this.removeReplica(replica);
        }
    }

    // Handles a network partition by electing a new leader among the replicas that can communicate with each other.
    async handleNetworkPartition() {
        const groups = this.groupReplicasByNetwork();
        const largestGroup = groups.reduce((a, b) => a.length > b.length ? a : b);
        const newLeader = largestGroup[0];
        if (newLeader !== this.leader) {
            this.leader = newLeader;
            await Promise.all(this.replicas.map(replica => replica.notifyLeader(this.leader)));
        }
    }

    // Groups replicas by network based on their ability to communicate with each other.
    groupReplicasByNetwork() {
        const groups = [];
        const visited = new Set();
        this.replicas.forEach(replica => {
            if (!visited.has(replica)) {
                const group = this.findReplicaGroup(replica, visited);
                groups.push(group);
            }
        });
        return groups;
    }

    // Finds the group of replicas that can communicate with the given replica.
    findReplicaGroup(replica, visited) {
        const group = [replica];
        visited.add(replica);
        this.replicas.forEach(other => {
            if (!visited.has(other) && this.canCommunicate(replica, other)) {
                const otherGroup = this.findReplicaGroup(other, visited);
                group.push(...otherGroup);
            }
        });
        return group;
    }

    // Checks if two replicas can communicate with each other.
    canCommunicate(replica1, replica2) {
        // TODO: Implement network communication check
        return true;
    }
}

class Replica {
    constructor(id) {
        this.id = id;
        this.leader = null;
        this.lastHeartbeat = Date.now();
        this.lastData = null;
        this.dataCache = new Map();
    }

    // Notifies the replica of the new leader.
    async notifyLeader(leader) {
        this.leader = leader;
    }

    // Checks if the replica has received a heartbeat from the leader recently.
    async checkHeartbeat() {
        const now = Date.now();
        if (now - this.lastHeartbeat > 5000) {
            this.leader.removeReplica(this);
        }
    }

    // Receives data from the leader for replication.
    receiveData(data) {
        this.lastData = data;
    }

    // Replicates data to the local log.
    async replicateData(data) {
        this.dataCache.set(data.id, data);
        // TODO: Write data to local log
    }

    // Retrieves data from the local cache or log.
    async getData(id) {
        let data = this.dataCache.get(id);
        if (!data) {
            // TODO: Read data from local log or external storage
            // Cache data to reduce future requests
            this.dataCache.set(id, data);
        }
        return data;
    }
}

// Main function
function main() {
    const replication = new Replication();

    // Create replicas
    const replica1 = new Replica(1);
    const replica2 = new Replica(2);
    const replica3 = new Replica(3);

    // Add replicas to replication
    replication.replicas.push(replica1, replica2, replica3);

    // Elect leader
    replication.electLeader();

    // Send data to leader for replication
    replication.sendData("Data to be replicated");
}

// Call main function
main();