import config from 'eslint-config-holy-grail';
import { defineConfig } from 'eslint/config';
import globals from 'globals';

// eslint-disable-next-line import/no-default-export
export default defineConfig([
    { extends: [config], languageOptions: { globals: { ...globals.node } }, rules: { 'no-sync': 'off', 'node/no-missing-require': 'off' } },
    {
        files: ['**/*.ts'],
        languageOptions: {
            parserOptions: {
                projectService: {
                    allowDefaultProject: [
                        'config/vitest/integration-chrome-canary.ts',
                        'config/vitest/integration-chrome-current.ts',
                        'config/vitest/integration-firefox-current.ts',
                        'config/vitest/integration-firefox-developer.ts',
                        'config/vitest/integration-safari-current.ts',
                        'config/vitest/unit.ts'
                    ]
                }
            }
        },
        rules: { '@typescript-eslint/strict-boolean-expressions': 'off' }
    }
]);
