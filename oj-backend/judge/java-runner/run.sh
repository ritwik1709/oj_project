#!/bin/bash

# Create Main.java from input
echo "$CODE" > Main.java

# Compile the code
javac Main.java 2> compile_error.txt

# If compilation fails, return error
if [ $? -ne 0 ]; then
    cat compile_error.txt
    exit 1
fi

# Run with input and time limit
timeout 2s java Main < input.txt 2> error.txt

# If execution fails, return error
if [ $? -eq 124 ]; then
    echo "Time Limit Exceeded"
    exit 1
elif [ $? -ne 0 ]; then
    cat error.txt
    exit 1
fi
