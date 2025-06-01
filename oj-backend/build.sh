#!/bin/bash

# Update package lists
apt-get update

# Install C++ compiler and tools
apt-get install -y g++

# Install Python
apt-get install -y python3 python3-pip

# Install Java
apt-get install -y default-jdk

# Install Node.js dependencies
npm install

# Create temp directory for code execution
mkdir -p temp
chmod 777 temp

echo "Build completed successfully" 