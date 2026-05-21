# Stage 1: Compilación
FROM maven:3.9-eclipse-temurin-21 AS builder
WORKDIR /build

# Build arg to allow skipping tests (default: true for backwards compat)
ARG SKIP_TESTS=true

# Copiar POM raíz e instalarlo
COPY pom.xml ./pom.xml
RUN mvn -N -B install

# Copiar POM intermedio (microservices) e instalarlo
COPY microservices/pom.xml ./microservices/pom.xml
RUN cd microservices && mvn -N -B install

# Copiar common-exception (dependencia compartida) y compilarlo
COPY microservices/common-exception/pom.xml ./microservices/common-exception/pom.xml
COPY microservices/common-exception/src ./microservices/common-exception/src
RUN cd microservices/common-exception && mvn -B -DskipTests install

# Copiar user-microservice y compilarlo
COPY microservices/user-microservice/pom.xml ./microservices/user-microservice/pom.xml
COPY microservices/user-microservice/src ./microservices/user-microservice/src
RUN cd microservices/user-microservice && mvn -B -DskipTests=${SKIP_TESTS} package

# Stage 2: Ejecución
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
COPY --from=builder /build/microservices/user-microservice/target/*.jar app.jar
EXPOSE 8091
ENTRYPOINT ["java", "-jar", "app.jar"]
