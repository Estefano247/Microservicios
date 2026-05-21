# Stage 1: Compilación
FROM maven:3.9-eclipse-temurin-21 AS builder
WORKDIR /build

# Copiar POM raíz (padre) e instalarlo en el repo local
COPY pom.xml ./pom.xml
RUN mvn -N -B install

# Copiar POM y src del config-server
COPY config-server/pom.xml ./config-server/pom.xml
COPY config-server/src ./config-server/src

# Compilar solo config-server
RUN cd config-server && mvn -B -DskipTests package

# Stage 2: Ejecución
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
COPY --from=builder /build/config-server/target/*.jar app.jar
EXPOSE 8888
ENTRYPOINT ["java", "-jar", "app.jar"]
