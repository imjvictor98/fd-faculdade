const splitSubStr = (str, start, end) => {
  const string = str.toString();
  const charIdentifier = string.substr(start, end).toLowerCase();

  return charIdentifier;
};

export default splitSubStr;
