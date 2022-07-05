import fs from 'fs';

type WriteFileArgs = {
  dryRun?: boolean,
};

const writeFile = (args: WriteFileArgs, filePath: string, content: string) => {
  if (args.dryRun) return;
  fs.writeFileSync(filePath, content, 'utf8');
};

export default writeFile;
