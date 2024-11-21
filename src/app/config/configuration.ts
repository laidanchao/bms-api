import * as yaml from 'js-yaml';
import { join } from 'path';
import * as fs from "fs";

export default () => {
  return yaml.load(
    fs.readFileSync(join(`${__dirname}/yaml`, `${process.env.NODE_ENV}.yml`), 'utf8'),
  ) as Record<string, any>;
}

