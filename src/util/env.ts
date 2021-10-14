import dotenv from 'dotenv';
import * as R from 'ramda';

dotenv.config();

type Env = {
  NEO4J_USERNAME: string;
  NEO4J_PASSWORD: string;
  NEO4J_HOST: string;
  NEO4J_PORT: string;
};

export default R.pick(
  [
    'NEO4J_USERNAME', 'NEO4J_PASSWORD',
    'NEO4J_HOST', 'NEO4J_PORT',
  ],
  process.env,
) as Env;
