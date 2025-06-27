const axios = require('axios');

exports.getCFUserInfo = async (handle) => {
  try {
    const response = await axios.get(
      `https://codeforces.com/api/user.info?handles=${handle}&checkHistoricHandles=false`
    );

    if (response.status === 'FAILED') {
      return ['failed', 'No user'];
    }

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
