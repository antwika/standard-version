import stringifyPackage from 'stringify-package';
import detectIndent from 'detect-indent';
import detectNewline from 'detect-newline';

export const readVersion = (contents: any) => JSON.parse(contents).version;

export const writeVersion = (contents: any, version: any) => {
  const json = JSON.parse(contents);
  const { indent } = detectIndent(contents);
  const newline = detectNewline(contents);
  json.version = version;

  if (json.packages && json.packages['']) {
    // package-lock v2 stores version there too
    json.packages[''].version = version;
  }

  return stringifyPackage(json, indent, newline);
};

export const isPrivate = (contents: any) => JSON.parse(contents).private;
