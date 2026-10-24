# Stage 1: Build
FROM maven:3.9.6-eclipse-temurin-17 AS build

WORKDIR /app

# Copy pom first for layer caching
# Paths are relative to repo root (Render uses repo root as build context)
COPY backend/pom.xml .
RUN mvn dependency:go-offline -B

# Copy source and build
COPY backend/src ./src
RUN mvn clean package -DskipTests -B

# Stage 2: Run
FROM eclipse-temurin:17-jre-alpine

WORKDIR /app

COPY --from=build /app/target/stresslab-backend-1.0.0.jar app.jar

ENV SERVER_PORT=8080

EXPOSE 8080

ENTRYPOINT ["java", "-jar", "app.jar"]
