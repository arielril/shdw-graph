import { v4 as uuid } from 'uuid';
import * as R from 'ramda';

import { INodeRepository, Neo4jDriver } from '../../types/infrastructure';
import { Node as NodeModel } from '../../types/model';
import { Logger } from '../../util/logger';

export class Node implements INodeRepository {
  private _driver: Neo4jDriver;

  constructor({ neoDriver }: any) {
    if (!neoDriver) {
      throw new Error('failed to connect to database');
    }

    this._driver = neoDriver;
  }

  async create(node: Partial<NodeModel>): Promise<NodeModel | undefined> {
    const uid = uuid();
    const session = this._driver.session();

    try {
      const res = await session.run(
        `create (n: Node { 
          uid: $uid,
          name: $name,
          service: $service,
          port: $port,
          tags: $tags
        }) return n`,
        R.pipe(
          R.pick(['name', 'service', 'port', 'tags']),
          R.assoc('uid', uid),
        )(node),
      );

      Logger.debug({ neo: res }, 'inserted node to database');
      return res.records[0] as unknown as NodeModel;
    } catch (error) {
      Logger.warn({ error }, 'failed to insert node into the database');
    } finally {
      session.close();
    }
  }
}
