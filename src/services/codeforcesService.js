const axios = require('axios');

exports.getCFUserInfo = async (handle) => {
  try {
    const response = await axios.get('https://codeforces.com/api/user.info', {
      params: {
        handles: handle,
        checkHistoricHandles: false,
      },
    });

    const user = response.result[0];

    return [
      'success',
      {
        handle: user.handle,
        firstName: user.firstName || null,
        rank: user.rank,
        rating: user.rating,
        maxRank: user.maxRank,
        maxRating: user.maxRating,
      },
    ];
  } catch (err) {
    return ['failed', 'Failed to fetch Codeforces user info'];
  }
};

exports.getProblems = async (tags) => {
  try {
    const response = await axios.get(
      'https://codeforces.com/api/problemset.problems',
      {
        params: tags ? { tags } : {},
      }
    );

    const problems = response.data.result.problems;

    return {
      status: 'success',
      problems,
    };
  } catch (err) {
    return {
      status: 'failed',
      message: 'Failed to fetch problems',
    };
  }
};
