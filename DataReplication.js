// Data replication
class Replication {
    constructor() {
        this.replicas = [];
        this.leader = null;
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
    }
}

class Replica {
    constructor(id) {
        this.id = id;
        this.leader = null;
        this.lastHeartbeat = Date.now();
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
}

// Create replicas
const replica1 = new Replica(1);
const replica2 = new Replica(2);
const replica3 = new Replica(3);

// Add replicas to replication instance
const replication = new Replication();
replication.replicas.push(replica1, replica2, replica3);

// Elect leader
replication.electLeader();

// Check leader of each replica
console.log(`Replica 1 leader: ${replica1.leader.id}`);
console.log(`Replica 2 leader: ${replica2.leader.id}`);
console.log(`Replica 3 leader: ${replica3.leader.id}`);