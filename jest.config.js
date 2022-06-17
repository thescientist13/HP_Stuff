module.exports = {
  testEnvironment: 'node',
  roots: [
		'<rootDir>/test',
		'<rootDir>/infrastructure/test'
	],
  testMatch: ['**/*.test.ts'],
  transform: {
    '^.+\\.tsx?$': 'ts-jest'
  }
};
