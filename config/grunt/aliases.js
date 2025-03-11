const { env } = require('process');

// eslint-disable-next-line padding-line-between-statements
const filter = (predicate, ...tasks) => (predicate ? tasks : []);
const isType = (...types) => env.TYPE === undefined || types.includes(env.TYPE);

module.exports = {
    build: ['sh:build'],
    test: ['build', ...filter(isType('integration'), 'sh:test-integration'), ...filter(isType('unit'), 'sh:test-unit')]
};
