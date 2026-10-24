import type { Trace } from './types';

export const traces: Record<string, Trace> = {
  'blocks-and-scope-nested': {
    title: 'Which names exist, line by line',
    file: 'foundations/scope_nested_blocks.cpp',
    steps: [
      { line: 8, note: 'Before `main` starts, the global `temperature` is created. It lives for the whole run of the program and is visible everywhere below its declaration.', vars: { 'temperature (global)': '12' } },
      { line: 11, note: 'Inside `main`, the name `temperature` refers to the global.', vars: { 'temperature (global)': '12' }, out: 'global temperature: 12\n' },
      { line: 13, note: '`seedlings` is local to `main`: it exists from here to the closing brace of `main`.', vars: { 'temperature (global)': '12', seedlings: '40' } },
      { line: 15, note: 'A new block has opened. `germinated` is created inside it, so it exists only until the matching `}`.', vars: { 'temperature (global)': '12', seedlings: '40', germinated: '8' } },
      { line: 16, note: 'Code inside the block can see names from the enclosing block: `seedlings` becomes 48.', vars: { 'temperature (global)': '12', seedlings: '48', germinated: '8' } },
      { line: 17, note: 'Printed from inside the block.', vars: { 'temperature (global)': '12', seedlings: '48', germinated: '8' }, out: 'inside the block: 48\n' },
      { line: 18, note: 'The block closes. `germinated` is destroyed: its scope and its lifetime both end here. The change it made to `seedlings` remains.', vars: { 'temperature (global)': '12', seedlings: '48' } },
      { line: 19, note: '`seedlings` is still alive in `main`.', vars: { 'temperature (global)': '12', seedlings: '48' }, out: 'after the block: 48\n' },
      { line: 22, note: 'A second block declares its own `temperature`. From here to the end of the block, the plain name means this local variable: it shadows the global.', vars: { 'temperature (global)': '12', seedlings: '48', 'temperature (local)': '18.5' } },
      { line: 23, note: 'The innermost declaration wins.', vars: { 'temperature (global)': '12', seedlings: '48', 'temperature (local)': '18.5' }, out: 'local temperature: 18.5\n' },
      { line: 24, note: '`::temperature` explicitly names the variable in the global scope, which was never changed.', vars: { 'temperature (global)': '12', seedlings: '48', 'temperature (local)': '18.5' }, out: '::temperature: 12\n' },
      { line: 25, note: 'The block closes and the local `temperature` is destroyed.', vars: { 'temperature (global)': '12', seedlings: '48' } },
      { line: 26, note: 'With the shadowing name gone, `temperature` again means the global.', vars: { 'temperature (global)': '12', seedlings: '48' }, out: 'global again: 12\n' },
      { line: 27, note: '`main` returns: `seedlings` is destroyed, and the global is destroyed as the program ends.', vars: { 'temperature (global)': '12', seedlings: '48' } },
    ],
  },
};
