import type { Trace } from './types';

// Formatting state of std::cout while format_kleiber_table.cpp runs. The
// printed text must equal format_kleiber_table.out (checked by the tests).
export const traces: Record<string, Trace> = {
  'formatting-output-state': {
    title: 'Which settings stick: the state of std::cout, step by step',
    file: 'io/format_kleiber_table.cpp',
    steps: [
      {"line": 22, "note": "Nothing has been formatted yet: std::cout starts in its default state. Width 0 means \"as wide as the value needs\".", "vars": {"notation": "default", "precision": "6", "adjust": "right", "width": "0"}},
      {"line": 26, "note": "The header. std::left applies to \"species\"; std::right is then set and stays for the rest of the line. Each setw was used up by the field that followed it, so the width is back to 0.", "vars": {"notation": "default", "precision": "6", "adjust": "right", "width": "0"}, "out": "species     mass (kg)    B (W)  B/M (W/kg)\n"},
      {"line": 31, "note": "First row. std::scientific and std::setprecision(2) format the mass; std::fixed then switches the notation, but precision 2 carries over to B and B/M. Only the widths had to be repeated.", "vars": {"notation": "fixed", "precision": "2", "adjust": "right", "width": "0"}, "out": "shrew        5.00e-03     0.06       12.79\n"},
      {"line": 31, "note": "The vole: the same settings, applied again on each pass. Scientific notation keeps masses spanning six orders of magnitude readable.", "vars": {"notation": "fixed", "precision": "2", "adjust": "right", "width": "0"}, "out": "vole         3.00e-02     0.25        8.17\n"},
      {"line": 31, "note": "The hare: the same settings, applied again on each pass. Scientific notation keeps masses spanning six orders of magnitude readable.", "vars": {"notation": "fixed", "precision": "2", "adjust": "right", "width": "0"}, "out": "hare         3.50e+00     8.70        2.49\n"},
      {"line": 31, "note": "The red deer: the same settings, applied again on each pass. Scientific notation keeps masses spanning six orders of magnitude readable.", "vars": {"notation": "fixed", "precision": "2", "adjust": "right", "width": "0"}, "out": "red deer     1.20e+02   123.27        1.03\n"},
      {"line": 31, "note": "The elephant: the same settings, applied again on each pass. Scientific notation keeps masses spanning six orders of magnitude readable.", "vars": {"notation": "fixed", "precision": "2", "adjust": "right", "width": "0"}, "out": "elephant     4.00e+03  1710.11        0.43\n"},
      {"line": 35, "note": "No manipulator on this line, yet B0 prints as 3.40: fixed notation and precision 2 are still in force.", "vars": {"notation": "fixed", "precision": "2", "adjust": "right", "width": "0"}, "out": "B0 = 3.40\n"},
      {"line": 36, "note": "std::defaultfloat and std::setprecision(6) restore the original state, and B0 prints as 3.4.", "vars": {"notation": "default", "precision": "6", "adjust": "right", "width": "0"}, "out": "B0 = 3.4\n"},
      {"line": 40, "note": "Six significant digits round 0.30000000000000004 to 0.3 and hide the rounding error of the binary sum.", "vars": {"notation": "default", "precision": "6", "adjust": "right", "width": "0"}, "out": "0.1 + 0.2 = 0.3\n"},
      {"line": 41, "note": "With max_digits10 (17 for double) every digit needed to identify the stored value is printed.", "vars": {"notation": "default", "precision": "17", "adjust": "right", "width": "0"}, "out": "0.1 + 0.2 = 0.30000000000000004\n"},
      {"line": 48, "note": "The CSV file is written by a different stream, out, with its own settings: plain separators, no widths, precision 17. Nothing appears on the console.", "vars": {"notation": "default", "precision": "17", "adjust": "right", "width": "0"}},
      {"line": 49, "note": "The confirmation goes to the console.", "vars": {"notation": "default", "precision": "17", "adjust": "right", "width": "0"}, "out": "wrote kleiber_rates.csv\n"},
    ],
  },
};
