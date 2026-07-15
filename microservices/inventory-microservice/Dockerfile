# Stage 1: Compilación
FROM maven:3.9-eclipse-temurin-21 AS builder
WORKDIR /build

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

# Copiar inventory-microservice y compilarlo
COPY microservices/inventory-microservice/pom.xml ./microservices/inventory-microservice/pom.xml
COPY microservices/inventory-microservice/src ./microservices/inventory-microservice/src
RUN cd microservices/inventory-microservice && mvn -B -DskipTests package

# Stage 2: Ejecución
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
COPY --from=builder /build/microservices/inventory-microservice/target/*.jar app.jar
EXPOSE 8093
ENTRYPOINT ["java", "-jar", "app.jar"]