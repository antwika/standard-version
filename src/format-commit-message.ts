const formatCommitMessage = (rawMsg: any, newVersion: any) => {
  const message = String(rawMsg);
  return message.replace(/{{currentTag}}/g, newVersion);
};

export default formatCommitMessage;
