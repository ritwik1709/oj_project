#!/bin/bash

# Debug: Show the input being used
echo "=== Input File Contents ==="
cat input.txt
echo "=========================="

# Create code.cpp from input
echo "$CODE" > code.cpp

# Debug: Show the code being compiled
echo "=== Source Code ==="
cat code.cpp
echo "==================="

# Compile the code with warnings
g++ -Wall code.cpp -o code.out 2> compile_error.txt

# If compilation fails, return error
if [ $? -ne 0 ]; then
  echo "=== Compilation Error ==="
  cat compile_error.txt
  echo "======================="
  exit 1
fi

# Run with input and capture output
timeout 2s ./code.out < input.txt > output.txt 2> error.txt
EXIT_CODE=$?

# Check for timeout
if [ $EXIT_CODE -eq 124 ]; then
    echo "Time Limit Exceeded"
    exit 1
fi

# Check for runtime errors
if [ $EXIT_CODE -ne 0 ]; then
    echo "=== Runtime Error ==="
    cat error.txt
    echo "===================="
    exit 1
fi

# Debug: Show the output
echo "=== Program Output ==="
cat output.txt
echo "===================="
