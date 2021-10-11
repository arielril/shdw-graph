import neo4j from 'neo4j-driver';

import { Neo4jConfig, Neo4jDriver } from '../../types/infrastructure';
import { Logger } from '../../util/logger';

let connection: Neo4jDriver;

const getConnection = (config: Neo4jConfig) => {
  if (connection) {
    return connection;
  }

  try {
    connection = neo4j.driver(
      `neo4j://${config.host}:7687`,
      neo4j.auth.basic(config.username, config.password),
    );

    return connection;
  } catch (error) {
    Logger.error({ error }, 'failed to connect to Neo4j');
    throw error;
  }
};

export { getConnection };
