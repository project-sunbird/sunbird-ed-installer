# Use an official PostgreSQL image as the base image
FROM postgres:latest

# Install psql client
RUN apt-get update && \
    apt-get install -y postgresql-client

# Install kubectl
RUN apt-get update && \
    apt-get install -y apt-transport-https gnupg jq curl && \
    curl -fsSL https://pkgs.k8s.io/core:/stable:/v1.30/deb/Release.key | gpg --dearmor -o /etc/apt/keyrings/kubernetes-apt-keyring.gpg && \
    chmod 644 /etc/apt/keyrings/kubernetes-apt-keyring.gpg && \ 
    echo 'deb [signed-by=/etc/apt/keyrings/kubernetes-apt-keyring.gpg] https://pkgs.k8s.io/core:/stable:/v1.30/deb/ /' | tee /etc/apt/sources.list.d/kubernetes.list && \
    chmod 644 /etc/apt/sources.list.d/kubernetes.list && \
    apt-get update && \
    apt-get install -y kubectl

# Copy the SQL script and shell script into the container
COPY execute_query.sh /usr/local/bin/execute_query.sh

# Make the script executable
RUN chmod +x /usr/local/bin/execute_query.sh

# Execute the script when the container starts
CMD ["/usr/local/bin/execute_query.sh"]
