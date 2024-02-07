FROM jboss/keycloak:7.0.1
RUN mkdir -p /opt/jboss/keycloak/providers
#COPY postgresql-9.4.1212.jar /opt/jboss/keycloak/modules/system/layers/keycloak/org/postgresql/main
COPY keycloak-email-phone-autthenticator-1.0-SNAPSHOT.jar /opt/jboss/keycloak/providers
#COPY module.xml /opt/jboss/keycloak/modules/system/layers/keycloak/org/postgresql/main
COPY sunbird /opt/jboss/keycloak/themes/sunbird
USER 1000
EXPOSE 8080
EXPOSE 8443
ENTRYPOINT [ "/opt/jboss/tools/docker-entrypoint.sh" ]
CMD ["-b", "0.0.0.0"]