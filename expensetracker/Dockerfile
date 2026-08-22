FROM eclipse-temurin:17-jdk

WORKDIR /app

# Copy Maven wrapper and project files
COPY .mvn/ .mvn/
COPY mvnw pom.xml ./

# Make Maven wrapper executable
RUN chmod +x mvnw

# Download dependencies
RUN ./mvnw dependency:go-offline -B

# Copy source code
COPY src/ src/

# Build Spring Boot application
RUN ./mvnw clean package -DskipTests -B

# Application port
EXPOSE 8080

# Start application
CMD ["sh", "-c", "java -jar target/*.jar"]
