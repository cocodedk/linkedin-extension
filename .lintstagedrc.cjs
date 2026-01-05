/**
 * lint-staged configuration
 * Runs checks on staged files before commit
 */

const { execSync } = require('child_process');
const path = require('path');

const checkFileSize = (filenames) => {
  const maxLines = 100;
  const violations = [];

  filenames.forEach((file) => {
    // Skip test files and config files from size check
    if (file.includes('.test.js') || file.includes('.config.js') || file.includes('node_modules')) {
      return;
    }

    try {
      const lineCount = parseInt(
        execSync(`wc -l < "${file}"`, { encoding: 'utf-8' }).trim(),
        10
      );
      if (lineCount > maxLines) {
        violations.push(`${file} (${lineCount} lines, max ${maxLines})`);
      }
    } catch (error) {
      console.error(`Error checking ${file}:`, error.message);
    }
  });

  if (violations.length > 0) {
    console.error('\n❌ File size violations detected:');
    violations.forEach((v) => console.error(`  - ${v}`));
    console.error('\nPlease refactor files to be ≤100 lines.');
    process.exit(1);
  }
};

const getAffectedTests = (filenames) => {
  const testFiles = [];
  filenames.forEach((file) => {
    if (file.includes('chrome/')) {
      const relativePath = file.replace('chrome/', '');
      const testPath = path.join('tests', relativePath.replace('.js', '.test.js'));
      testFiles.push(testPath);
    }
  });
  return testFiles.filter((f) => {
    try {
      const fs = require('fs');
      return fs.existsSync(f);
    } catch {
      return false;
    }
  });
};

module.exports = {
  '*.js': (filenames) => {
    // Check file sizes first (skip test files)
    checkFileSize(filenames.filter((f) => !f.includes('.test.js')));

    // Run ESLint and Prettier
    const commands = [
      `eslint --fix ${filenames.join(' ')}`,
      `prettier --write ${filenames.join(' ')}`
    ];

    return commands;
  },
  '*.{json,md}': (filenames) => {
    return `prettier --write ${filenames.join(' ')}`;
  }
};
