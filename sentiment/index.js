const natural = require('natural');

function analyze(text) {
  const tokenizer = new natural.WordTokenizer();
  const tokens = tokenizer.tokenize(text || '');

  return {
    tokenCount: tokens.length
  };
}

module.exports = { analyze };
