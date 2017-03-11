const helpers = {
  loggedIn(req, res, next) {
    if (req.user !== undefined) {
      next();
    } else {
      res.json({ status: 401, redirect: '/admin/login' });
    }
  },
  slugify(str) {
    return str
      .toLowerCase()
      .replace(/^\s+|\s+$/g, '')   // Trim leading/trailing whitespace
      .replace(/[-\s]+/g, '-')     // Replace spaces with dashes
      .replace(/[^a-z0-9-]/g, '')  // Remove disallowed symbols
      .replace(/--+/g, '-');
  },
  reduceToObj(arr, key, value, start) {
    return arr
      .reduce((prev, curr) =>
      Object.assign({}, prev, { [curr[key]]: curr[value] }), start || {});
  },
  shuffle(arr) {
    const array = arr;
    let currentIndex = array.length;
    let temporaryValue;
    let randomIndex;
    // While there remain elements to shuffle...
    while (currentIndex !== 0) {
      // Pick a remaining element...
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex -= 1;
      // And swap it with the current element.
      temporaryValue = array[currentIndex];
      array[currentIndex] = array[randomIndex];
      array[randomIndex] = temporaryValue;
    }
    return array;
  },
};

module.exports = helpers;
