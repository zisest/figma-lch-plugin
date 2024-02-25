const globals = require('globals')
// eslint:recommended
const js = require('@eslint/js')
const typescriptEslintPlugin = require('@typescript-eslint/eslint-plugin')
const typescriptParser = require('@typescript-eslint/parser')
const figma = require('@figma/eslint-plugin-figma-plugins')

const unusedImportsPlugin = require('eslint-plugin-unused-imports')
const importsPlugin = require('eslint-plugin-import')


module.exports = [
    {
        ...js.configs.recommended,
        files: ['src/**/*.ts'],
    },
    {
        rules: {
            ...typescriptEslintPlugin.configs['eslint-recommended'].rules,
            ...typescriptEslintPlugin.configs['recommended'].rules,
        },
        files: ['src/**/*.ts'],
    },
    {
        rules: figma.configs.recommended.rules,
        files: ['src/**/*.ts'],
        plugins: {
            '@figma/figma-plugins': figma,
        },
        languageOptions: {
            parser: typescriptParser,
            parserOptions: {
                project: 'tsconfig.json',
            },
        },
    },
    {
        files: ['src/**/*.ts'],
        rules: {
            'prefer-const': 'error', // 'indent': ['error', 4],
            'linebreak-style': ['error', 'unix'],
            quotes: ['error', 'single'],
            semi: ['error', 'always'],
            'no-duplicate-imports': 2,
            'guard-for-in': 1,
            'comma-spacing': 2,
            'arrow-parens': ['error', 'as-needed'],
            'no-multiple-empty-lines': [
                2,
                {
                    max: 1,
                    maxBOF: 1,
                    maxEOF: 1,
                },
            ],
            'no-trailing-spaces': 2,
            'no-whitespace-before-property': 2,
            'nonblock-statement-body-position': 2,
            'default-param-last': 2,
            // Unused imports & unused vars
            '@typescript-eslint/no-unused-vars': 'off',
            'no-unused-vars': 'off',
            'unused-imports/no-unused-imports': 'error',
            'unused-imports/no-unused-vars': [
                'warn',
                {
                    vars: 'all',
                    varsIgnorePattern: '^_',
                    args: 'after-used',
                    argsIgnorePattern: '^_',
                },
            ],
            // ----
            '@typescript-eslint/consistent-type-imports': ['error', { fixStyle: 'inline-type-imports' }],
            '@typescript-eslint/no-namespace': 'off',
            'no-dupe-class-members': 'off',
            '@typescript-eslint/no-this-alias': [
                'error',
                {
                    allowDestructuring: true,
                    allowedNames: ['self', '_this'],
                },
            ],
            'no-redeclare': 'off',
            '@typescript-eslint/no-redeclare': 'error',
            // Imports
            // Предупреждает о циклических импортах
            'import/no-cycle': 2,
            // Сортировка порядка импортов
            'import/order': [
                'error',
                {
                    groups: ['builtin', 'external', 'internal', 'parent', 'sibling', 'index', 'object', 'type'],
                    pathGroups: [
                        {
                            pattern: '*.sass',
                            group: 'type',
                            patternOptions: { matchBase: true },
                            position: 'after',
                        },
                    ],
                },
            ],
            'import/no-unused-modules': 2,
            'import/no-unresolved': [
                2,
                {
                    caseSensitiveStrict: true,
                },
            ],
        },
        languageOptions: {
            ecmaVersion: 'latest',
            parser: typescriptParser,
            sourceType: 'module',
            globals: {
                ...globals.node,
                NodeJS: true,
                fetch: true,
                RequestInit: true,
                figma: 'readonly',
                SceneNode: true,
            },
        },
        settings: {
            'import/parsers': {
                '@typescript-eslint/parser': ['.ts', '.tsx'],
            },
            'import/resolver': {
                typescript: {
                    // always try to resolve types under `<root>@types` directory
                    // even if it doesn't contain any source code, like `@types/unist`
                    alwaysTryTypes: true,
                },
                node: false,
            },
        },
        plugins: {
            '@typescript-eslint': typescriptEslintPlugin,
            'unused-imports': unusedImportsPlugin,
            import: importsPlugin,
        },
    },
]
