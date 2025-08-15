module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [
      2,
      'always',
      [
        'feat' /* New feature */,
        'fix' /* Fix bug */,
        'improve' /* Improve code */,
        'refactor' /* Refactor code */,
        'docs' /* Add documentation(s) */,
        'chore' /* Minor change(s) in developing */,
        'style' /* Format file(s) (Doesn't affect the code logic) */,
        'test' /* Create (a) test(s) */,
        'revert' /* Revert previous commit(s) */,
        'ci' /* Change CI/CD configuration(s) */,
        'build' /* Build */,
      ],
    ],
    'type-case': [2, 'always', 'lower-case'],
    'type-empty': [2, 'never'],
    'subject-empty': [2, 'never'],
    'subject-full-stop': [2, 'never', '.'],
    'header-max-length': [2, 'always', 72],
  },
};
