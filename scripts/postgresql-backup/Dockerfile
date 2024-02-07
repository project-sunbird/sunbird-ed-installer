FROM --platform=linux/amd64 alpine:3.9

RUN apk --no-cache add postgresql-client=11.11-r0
RUN apk update && \
    apk add --no-cache bash ca-certificates curl openssl libffi python3 && \
    apk add --no-cache --virtual=build gcc musl-dev openssl-dev libffi-dev python3-dev && \
    curl https://bootstrap.pypa.io/pip/3.6/get-pip.py -o get-pip.py && \
    python3 get-pip.py && \
    pip install --upgrade pip && \
    pip install azure-cli && \
    apk del --purge build && \
    rm -rf /var/cache/apk/* && \
    rm get-pip.py

COPY ./postgres-backup.sh /

ENTRYPOINT ["sh", "/postgres-backup.sh"]