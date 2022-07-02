const fs = require('fs');

module.exports = (args, filePath, content) => {
  if (args.dryRun) return;
  fs.writeFileSync(filePath, content, 'utf8');
};
