exports.filterProblems = (problems, minRating, maxRating) => {
  const filtered = problems.filter(
    (problem) =>
      problem.rating &&
      problem.rating >= minRating &&
      problem.rating <= maxRating
  );

  return filtered;
};

exports.selectProblems = (problems, count) => {
  // (Fisher-Yates Shuffle)
  for (let i = problems.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [problems[i], problems[j]] = [problems[j], problems[i]];
  }

  const selectedProblems = problems.slice(0, count).map((problem) => ({
    name: problem.name,
    index: problem.index,
    contestId: problem.contestId,
    rating: problem.rating,
    tags: problem.tags,
    link: `https://codeforces.com/problemset/problem/${problem.contestId}/${problem.index}`,
    isSolved: false,
  }));

  return selectedProblems;
};
