import fs from 'fs';
import { Args } from './standard-version';

const writeFile = (args: Args, filePath: string, content: string) => {
  if (args.dryRun) return;
  fs.writeFileSync(filePath, content, 'utf8');
};

export default writeFile;
