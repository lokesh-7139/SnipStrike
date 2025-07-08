const problemCache = new Map();

const setProblems = (sessionId, problems) => {
  problemCache.set(sessionId, problems);
};

const getProblems = (sessionId) => {
  return problemCache.get(sessionId);
};

const hasProblems = (sessionId) => {
  return problemCache.has(sessionId);
};

const deleteProblems = (sessionId) => {
  problemCache.delete(sessionId);
};

module.exports = {
  setProblems,
  getProblems,
  hasProblems,
  deleteProblems,
};
