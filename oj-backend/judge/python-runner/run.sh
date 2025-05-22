#!/bin/bash

# Create code.py from input
echo "$CODE" > code.py

# Run with input and time limit
timeout 2s python3 code.py < input.txt 2> error.txt

# If execution fails, return error
if [ $? -eq 124 ]; then
    echo "Time Limit Exceeded"
    exit 1
elif [ $? -ne 0 ]; then
    cat error.txt
    exit 1
fi
