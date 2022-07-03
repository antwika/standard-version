import stringifyPackage from 'stringify-package';
import detectIndent from 'detect-indent';
import detectNewline from 'detect-newline';

export const readVersion = (contents: string): string => JSON.parse(contents).version;

export const writeVersion = (contents: string, version: string): string => {
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

export const isPrivate = (contents: string): boolean => JSON.parse(contents).private;
