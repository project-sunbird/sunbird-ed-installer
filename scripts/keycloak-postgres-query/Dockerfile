# Use an official PostgreSQL image as the base image
FROM postgres:latest

# Install psql client
RUN apt-get update && \
    apt-get install -y postgresql-client

# Install kubectl
RUN apt-get update && \
    apt-get install -y apt-transport-https gnupg jq curl && \
    curl -s https://packages.cloud.google.com/apt/doc/apt-key.gpg | apt-key add - && \
    echo "deb https://apt.kubernetes.io/ kubernetes-xenial main" > /etc/apt/sources.list.d/kubernetes.list && \
    apt-get update && \
    apt-get install -y kubectl

# Copy the SQL script and shell script into the container
COPY execute_query.sh /usr/local/bin/execute_query.sh

# Make the script executable
RUN chmod +x /usr/local/bin/execute_query.sh

# Execute the script when the container starts
CMD ["/usr/local/bin/execute_query.sh"]
