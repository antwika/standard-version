import fs from 'fs';

// TODO: This type is incomplete and just types a subset of its properties.
type WriteFileArgs = {
  dryRun?: boolean,
  [key: string]: any;
};

const writeFile = (args: WriteFileArgs, filePath: string, content: string) => {
  if (args.dryRun) return;
  fs.writeFileSync(filePath, content, 'utf8');
};

export default writeFile;
