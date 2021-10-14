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

  private setDefaultValues = R.mergeDeepRight({
    name: 'TBD',
    service: '-1',
    port: -1,
    tags: [],
    metadata: {},
  });

  async create(node: Partial<NodeModel>): Promise<NodeModel> {
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
          R.tap(x => console.log('!#!#@#!#!@#!@', x)),
          this.setDefaultValues,
          R.tap(x => console.log('!#!#@#!#!@#!@', x)),
          R.assoc('uid', uid),
          R.tap(x => console.log('!#!#@#!#!@#!@', x)),
        )(node),
      );

      Logger.debug({ neo: res }, 'inserted node to database');
      return res.records[0] as unknown as NodeModel;
    } catch (error) {
      Logger.warn({ error }, 'failed to insert node into the database');
      throw error;
    } finally {
      session.close();
    }
  }

  async find(node: Partial<NodeModel>): Promise<NodeModel[]> {
    const session = this._driver.session();

    try {
      const __filter__ = R.pick(['uid', 'name', 'port', 'service'], node);

      const filterQuery = Object.keys(__filter__)
        .map(k => `${k}: $${k}`);


      const res = await session.run(
        `match (n: Node { ${filterQuery.join(',')} }) return n`,
        __filter__,
      );

      return res.records as unknown as NodeModel[];
    } catch (error) {
      Logger.warn({ error }, 'failed to search for node');
      throw error;
    } finally {
      session.close();
    }
  }

  async update(filter: Partial<NodeModel>, data: Partial<NodeModel>): Promise<NodeModel> {
    const session = this._driver.session();

    try {
      const dataKeys = ['name', 'port', 'service', 'tags'];
      const __filter__ = R.pick([...dataKeys, 'uid'], filter);

      const updateData = {
        nameK: data.name,
        portK: data.port,
        serviceK: data.service,
        tagsK: data.tags,
      };

      const res = await session.run(
        `merge (n: Node {
          uid: $uid,
          name: $name,
          port: $port,
          service: $service,
          tags: $tags
        }) 
        on create ${dataKeys.map(k => `n.${k} = $${k}K`).join(',')}
        return n`,
        R.mergeDeepLeft(__filter__, updateData),
      );

      return res.records[0] as unknown as NodeModel;
    } catch (error) {
      Logger.warn({ error }, 'failed to update node');
      throw error;
    } finally {
      session.close();
    }
  }
}
