// Data replication
class Replication {
    constructor() {
        this.replicas = [];
        this.leader = null;
        this.messageQueue = [];
    }

    // Subtask 1: Implement a consensus algorithm that ensures all replicas of a partition have the same data in the same order.
    electLeader() {
        // Sort replicas by ID
        this.replicas.sort((a, b) => a.id - b.id);

        // Elect replica with lowest ID as leader
        this.leader = this.replicas[0];

        // Notify all replicas of new leader
        this.replicas.forEach(replica => replica.notifyLeader(this.leader));

        // Subtask 2: Implement a protocol for the leader to send heartbeats to the followers to ensure they are still alive.
        setInterval(() => {
            this.replicas.forEach(replica => {
                if (replica !== this.leader) {
                    replica.checkHeartbeat();
                }
            });
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
    sendData(data) {
        this.messageQueue.push(data);
    }
}

class Replica {
    constructor(id) {
        this.id = id;
        this.leader = null;
        this.lastHeartbeat = Date.now();
        this.lastData = null;
    }

    // Notifies the replica of the new leader.
    notifyLeader(leader) {
        this.leader = leader;
    }

    // Checks if the replica has received a heartbeat from the leader recently.
    checkHeartbeat() {
        const now = Date.now();
        if (now - this.lastHeartbeat > 5000) {
            this.leader = null;
        }
    }

    // Receives data from the leader for replication.
    receiveData(data) {
        this.lastData = data;
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