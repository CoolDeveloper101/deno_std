// deno-fmt-ignore-file
// deno-lint-ignore-file

// Copyright Joyent and Node contributors. All rights reserved. MIT license.
// Taken from Node 18.8.0
// This file is automatically generated by "node/_tools/setup.ts". Do not modify this file manually

// TODO(#2674): The process.argv[3] check should be argv[2], and the
// command passed to exec() should not need to include "run", "-A",
// "--unstable", and "require.ts".

'use strict';
const common = require('../common');
const assert = require('assert');
const cp = require('child_process');
const stdoutData = 'foo';
const stderrData = 'bar';
const expectedStdout = `${stdoutData}\n`;
const expectedStderr = `${stderrData}\n`;

if (process.argv[3] === 'child') {
  // The following console calls are part of the test.
  console.log(stdoutData);
  console.error(stderrData);
} else {
  const cmd = `"${process.execPath}" run -A --unstable require.ts "${__filename}" child`;
  const child = cp.exec(cmd, common.mustSucceed((stdout, stderr) => {
    assert.strictEqual(stdout, expectedStdout);
    assert.strictEqual(stderr, expectedStderr);
  }));
  child.stdout.setEncoding('utf-8');
  child.stderr.setEncoding('utf-8');
}
