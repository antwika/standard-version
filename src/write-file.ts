import fs from 'fs';

const writeFile = (args: any, filePath: string, content: string) => {
  if (args.dryRun) return;
  fs.writeFileSync(filePath, content, 'utf8');
};

export default writeFile;
