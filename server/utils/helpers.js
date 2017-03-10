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
};

module.exports = helpers;
