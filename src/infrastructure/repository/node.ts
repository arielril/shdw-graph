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
    tags: [],
  });

  private getCreateNodeQueryProps = R.pipe(
    Object.keys,
    R.map(key => `${key}: $${key}`),
    R.join(','),
  );

  async create(node: Partial<NodeModel>): Promise<NodeModel> {
    const uid = uuid();
    const session = this._driver.session();

    try {
      const insertNode = R.pipe(
        R.pick(['name', 'port', 'tags', 'metadata']),
        this.setDefaultValues,
      )(node) as NodeModel;

      const res = await session.run(
        `merge (n: Node { 
          ${this.getCreateNodeQueryProps(insertNode)}
        }) 
        on create
          set n.uid = randomUUID()
        return n`,
        insertNode,
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
      const __filter__ = R.pick(['uid', 'name', 'port'], node);

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
      const setQueryKeys = Object.keys(R.omit(['uid'], data))
        .map(k => `n.${k} = $${k}`)
        .join(',');

      let setQuery = '';
      if (setQueryKeys) {
        setQuery = `set ${setQueryKeys}`
      }

      const query = `match (n: Node { uid: $uid })
        ${setQuery}
        return n`;

      const res = await session.run(
        query,
        R.mergeDeepLeft(filter, data),
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
