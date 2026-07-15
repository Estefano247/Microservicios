# Stage 1: Compilación
FROM maven:3.9-eclipse-temurin-21 AS builder
WORKDIR /build

# Copiar POM raíz (padre) e instalarlo en el repo local
COPY pom.xml ./pom.xml
RUN mvn -N -B install

# Copiar POM y src del discovery-server
COPY discovery-server/pom.xml ./discovery-server/pom.xml
COPY discovery-server/src ./discovery-server/src

# Compilar solo discovery-server
RUN cd discovery-server && mvn -B -DskipTests package

# Stage 2: Ejecución
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
COPY --from=builder /build/discovery-server/target/*.jar app.jar
EXPOSE 8761
ENTRYPOINT ["java", "-jar", "app.jar"]