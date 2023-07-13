module.exports = (grunt) => {
    const continuous = grunt.option('continuous') === true;

    return {
        'build-es2019': {
            cmd: 'tsc --project src/tsconfig.json'
        },
        'build-es5': {
            cmd: 'rollup --config config/rollup/bundle.mjs'
        },
        'clean': {
            cmd: 'rimraf build/*'
        },
        'lint-config': {
            cmd: 'npm run lint:config'
        },
        'lint-src': {
            cmd: 'npm run lint:src'
        },
        'lint-test': {
            cmd: 'npm run lint:test'
        },
        'test-integration': {
            cmd: `karma start config/karma/config-integration.js ${continuous ? '--concurrency Infinity' : '--single-run'}`
        },
        'test-unit': {
            cmd: `karma start config/karma/config-unit.js ${continuous ? '--concurrency Infinity' : '--single-run'}`
        }
    };
};
