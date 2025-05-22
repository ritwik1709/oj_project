FROM openjdk:17-slim

WORKDIR /app

# Create a non-root user
RUN useradd -m runner

# Give appropriate permissions
RUN chown -R runner:runner /app

# Switch to non-root user
USER runner

CMD ["/bin/bash"]
