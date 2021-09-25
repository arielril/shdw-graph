export type Node = {
  uid: string; // unique identifier
  name?: string; // name for better identification
  edges: {
    goFrom: Edge[];
    comeTo: Edge[];
  }[];
  service?: string; // running service (can be used in the place of `name`)
  port?: number; // port of the service that is running
  tags?: string[];
  metadata?: {
    // the command that was executed 
    // it is available when the Node is a "command"
    command?: string;
  };
};

export type Edge = {
  uid: string; // unique identifier
  label?: string; // human readable edge name
  originNode: Node;
  destinationNode: Node;
  weight: number; // default: 0
  tags?: string[];
};
