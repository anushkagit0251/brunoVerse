# Multi-stage Dockerfile for BrunoVerse Spring Boot Backend
FROM maven:3.9.9-eclipse-temurin-21-alpine AS builder
WORKDIR /build

# Cache maven dependencies
COPY pom.xml .
RUN mvn dependency:go-offline -B

# Copy source and package
COPY src ./src
RUN mvn clean package -DskipTests

# Runtime stage
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app

# Create uploads directory for persistent storage
RUN mkdir -p /uploads && chmod 777 /uploads

# Copy built artifact
COPY --from=builder /build/target/*.jar app.jar

ENV PORT=8080
ENV UPLOAD_DIR=/uploads
EXPOSE 8080

ENTRYPOINT ["java", "-Djava.security.egd=file:/dev/./urandom", "-jar", "app.jar"]
