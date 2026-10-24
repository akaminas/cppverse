import type { Trace } from './types';

const split = `const std::string line{"Q1,Plantago lanceolata,14"};
std::istringstream stream{line};
std::vector<std::string> fields;
std::string field;
while (std::getline(stream, field, ',')) {
    fields.push_back(field);
}
const int count = std::stoi(fields[2]);`;

export const traces: Record<string, Trace> = {
  'string-streams-split': {
    title: 'Splitting one CSV line into fields',
    code: split,
    steps: [
      { line: 2, note: 'The string stream holds a copy of the line; nothing has been read yet.', vars: { unread: '"Q1,Plantago lanceolata,14"', stream: 'good' } },
      { line: 4, note: 'An empty vector for the fields and a string for the current field.', vars: { unread: '"Q1,Plantago lanceolata,14"', stream: 'good', field: '""', fields: '{}' } },
      { line: 5, note: 'getline copies characters into field up to the first comma, then removes the comma from the stream without storing it.', vars: { unread: '"Plantago lanceolata,14"', stream: 'good', field: '"Q1"', fields: '{}' } },
      { line: 6, note: 'The first field is stored.', vars: { unread: '"Plantago lanceolata,14"', stream: 'good', field: '"Q1"', fields: '{"Q1"}' } },
      { line: 5, note: 'The next field contains a space. Unlike >>, getline does not stop at whitespace, only at the delimiter.', vars: { unread: '"14"', stream: 'good', field: '"Plantago lanceolata"', fields: '{"Q1"}' } },
      { line: 6, note: 'Second field stored.', vars: { unread: '"14"', stream: 'good', field: '"Plantago lanceolata"', fields: '{"Q1", "Plantago lanceolata"}' } },
      { line: 5, note: 'getline reads "14" and reaches the end of the string. It read characters, so it succeeded; eofbit is set but failbit is not.', vars: { unread: '""', stream: 'eof', field: '"14"', fields: '{"Q1", "Plantago lanceolata"}' } },
      { line: 6, note: 'Third field stored.', vars: { unread: '""', stream: 'eof', field: '"14"', fields: '{"Q1", "Plantago lanceolata", "14"}' } },
      { line: 5, note: 'The stream is already at its end (eofbit), so this getline fails at once: failbit is set, field is left unchanged and the loop ends.', vars: { unread: '""', stream: 'fail + eof', field: '"14"', fields: '{"Q1", "Plantago lanceolata", "14"}' } },
      { line: 8, note: 'The third field is still text; std::stoi converts it to the number 14.', vars: { fields: '{"Q1", "Plantago lanceolata", "14"}', count: '14' } },
    ],
  },
};
