# BrunoVerse – one container: Spring Boot API + the website
# Memory settings fit a 512 MB server (Render free).
# Build:  docker build -t brunoverse .
# Run:    docker run -p 8080:8080 -e JWT_SECRET=change-me-to-32-random-characters brunoverse
FROM maven:3.9-eclipse-temurin-17 AS build
WORKDIR /build
COPY backend/pom.xml .
RUN mvn -q -B dependency:go-offline
COPY backend/src ./src
RUN mvn -q -B package -DskipTests

FROM eclipse-temurin:17-jre
WORKDIR /app
COPY --from=build /build/target/brunoverse-backend-1.0.0.jar app.jar
COPY frontend ./frontend
ENV SPRING_PROFILES_ACTIVE=prod \
    FRONTEND_DIR=file:/app/frontend/ \
    JAVA_TOOL_OPTIONS="-Xmx256m -XX:MaxMetaspaceSize=160m -XX:ReservedCodeCacheSize=40m -XX:+UseSerialGC -Xss512k -XX:TieredStopAtLevel=1"
EXPOSE 8080
CMD ["java", "-jar", "app.jar"]
