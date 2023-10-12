// Data replication
class Replication {
    constructor() {
        this.replicas = [];
        this.leader = null;
    }

    // Elects a leader among the replicas.
    electLeader() {
        // Sort replicas by ID
        this.replicas.sort((a, b) => a.id - b.id);

        // Elect replica with lowest ID as leader
        this.leader = this.replicas[0];

        // Notify all replicas of new leader
        this.replicas.forEach(replica => replica.notifyLeader(this.leader));
    }
}

class Replica {
    constructor(id) {
        this.id = id;
        this.leader = null;
    }

// Notifies the replica of the new leader.
    notifyLeader(leader) {
        this.leader = leader;
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