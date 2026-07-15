# Stage 1: Compilación
FROM maven:3.9-eclipse-temurin-21 AS builder
WORKDIR /build

# Copiar POM raíz e instalarlo
COPY pom.xml ./pom.xml
RUN mvn -N -B install

# Copiar POM intermedio (microservices) e instalarlo
COPY microservices/pom.xml ./microservices/pom.xml
RUN cd microservices && mvn -N -B install

# Copiar api-gateway y compilarlo (no depende de common-exception)
COPY microservices/api-gateway/pom.xml ./microservices/api-gateway/pom.xml
COPY microservices/api-gateway/src ./microservices/api-gateway/src
RUN cd microservices/api-gateway && mvn -B -DskipTests package

# Stage 2: Ejecución
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
COPY --from=builder /build/microservices/api-gateway/target/*.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]