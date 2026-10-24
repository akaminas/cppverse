#!/usr/bin/env bash
# Compiles and runs every C++ example in cpp-examples/.
#  - Programs are compiled with -Wall -Wextra -Wpedantic -Werror at the
#    language standard named in their "// Standard:" header line.
#  - Programs marked "// Expect: compile-error" must FAIL to compile with the
#    same flags (so a warning promoted by -Werror also counts as the error).
#  - If <name>.out exists, standard output must match it exactly.
#  - <name>.in is fed to standard input; <name>.args gives arguments.
# Executables and outputs go to cpp-build/ for the benchmark comparison.
#   CXX=clang++ scripts/check-cpp.sh   # use another compiler
set -uo pipefail
CXX=${CXX:-g++}
ROOT=$(cd "$(dirname "$0")/.." && pwd)
OUT="$ROOT/cpp-build"
mkdir -p "$OUT"
fail=0
count=0
echo "Compiler: $($CXX --version | head -n1)"
while IFS= read -r -d '' src; do
  rel=${src#"$ROOT/cpp-examples/"}
  grep -q "int main(" "$src" || continue
  std=$(grep -m1 -iE '^// *Standard:' "$src" | sed -E 's/^.*[Ss]tandard: *//' | tr 'A-Z' 'a-z' | tr -d ' \r')
  std=${std:-c++17}
  dir=$(dirname "$src")
  base="${src%.cpp}"
  name=$(basename "$base")
  exe="$OUT/${rel%.cpp}"
  mkdir -p "$(dirname "$exe")"
  extra=()
  for inc in $(grep -oE '#include "[^"]+\.hpp"' "$src" | sed -E 's/#include "(.+)\.hpp"/\1/'); do
    [ -f "$dir/$inc.cpp" ] && extra+=("$dir/$inc.cpp")
  done
  count=$((count + 1))
  if grep -qiE '^// *Expect: *compile-error' "$src"; then
    if $CXX -std="$std" -fsyntax-only -Wall -Wextra -Wpedantic -Werror "$src" > /dev/null 2>&1; then
      echo "FAIL $rel compiled, but it is meant to demonstrate a compiler error"
      fail=1
    else
      echo "ok   $rel (fails to compile, as intended)"
    fi
    continue
  fi
  if ! $CXX -std="$std" -Wall -Wextra -Wpedantic -Werror -O2 "$src" "${extra[@]}" -o "$exe" 2> "$exe.log"; then
    echo "FAIL $rel does not compile cleanly with $CXX -std=$std"
    cat "$exe.log"
    fail=1
    continue
  fi
  args=""
  [ -f "$base.args" ] && args=$(tr -d '\r' < "$base.args")
  input=/dev/null
  [ -f "$base.in" ] && input="$base.in"
  # shellcheck disable=SC2086
  (cd "$dir" && timeout 120 "$exe" $args < "$input" > "$exe.stdout" 2> "$exe.stderr")
  status=$?
  if [ $status -ne 0 ]; then
    echo "FAIL $rel exited with status $status"
    cat "$exe.stderr"
    fail=1
    continue
  fi
  if [ -f "$base.out" ]; then
    if ! diff -u --strip-trailing-cr "$base.out" "$exe.stdout" > "$exe.diff"; then
      echo "FAIL $rel: output differs from $name.out"
      cat "$exe.diff"
      fail=1
      continue
    fi
    echo "ok   $rel (output matches $name.out)"
  else
    echo "ok   $rel"
  fi
done < <(find "$ROOT/cpp-examples" -name '*.cpp' -print0 | sort -z)
echo "$count programs checked with $CXX"
exit $fail
