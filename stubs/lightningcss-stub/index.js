module.exports.transform = function transform(options) {
  // Return the original code buffer/string as-is so it does not break compilation.
  return {
    code: options.code,
  };
};

module.exports.transformStyleAttribute = function transformStyleAttribute(options) {
  return {
    code: options.code,
  };
};

module.exports.bundle = function bundle(options) {
  return {
    code: options.code || "",
  };
};

module.exports.bundleAsync = function bundleAsync(options) {
  return Promise.resolve({
    code: options.code || "",
  });
};

module.exports.browserslistToTargets = function browserslistToTargets() {
  return {};
};

module.exports.composeVisitors = function composeVisitors() {
  return {};
};

module.exports.Features = {};
