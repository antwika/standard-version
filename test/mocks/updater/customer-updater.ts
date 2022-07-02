const REPLACER = /version: "(.*)"/;

export const readVersion = (contents: any) => {
  const result = REPLACER.exec(contents);
  if (!result) return undefined;
  return result[1];
};

export const writeVersion = (contents: any, version: any) => {
  const result = REPLACER.exec(contents);
  if (!result) return undefined;
  return contents.replace(result[0], `version: "${version}"`);
};
