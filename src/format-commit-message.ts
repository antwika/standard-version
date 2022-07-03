const formatCommitMessage = (rawMsg: string, newVersion: string) => {
  const message = String(rawMsg);
  return message.replace(/{{currentTag}}/g, newVersion);
};

export default formatCommitMessage;
