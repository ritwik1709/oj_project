FROM python:3.9-slim

WORKDIR /app

# Create a non-root user
RUN useradd -m runner

# Give appropriate permissions
RUN chown -R runner:runner /app

# Install any necessary Python packages
RUN pip install --no-cache-dir --upgrade pip

# Switch to non-root user
USER runner

# Set Python to run in unbuffered mode
ENV PYTHONUNBUFFERED=1

# Set the default command
CMD ["/bin/bash"]
