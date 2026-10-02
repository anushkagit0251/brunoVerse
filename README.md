# BrunoVerse Backend

Java 21 + Spring Boot + MySQL backend for the BrunoVerse animal-welfare platform.

## Open in IntelliJ

1. Extract this ZIP.
2. Open the extracted `BrunoVerse-backend` folder in IntelliJ IDEA.
3. Let Maven load dependencies.
4. Create a MySQL database:

```sql
CREATE DATABASE brunoverse;
```

5. Open:
`src/main/resources/application.properties`

6. Replace:

```properties
spring.datasource.password=YOUR_MYSQL_PASSWORD
```

with your MySQL password.

7. Run:

`BrunoVerseApplication.java`

## Current APIs

### Register
POST `/api/auth/register`

Example:

```json
{
  "name": "Anushka",
  "email": "anushka@example.com",
  "phone": "9876543210",
  "password": "123456",
  "role": "PET_OWNER"
}
```

Available roles:

- PET_OWNER
- RESCUER
- VETERINARIAN
- NGO
- VOLUNTEER

### Login
POST `/api/auth/login`

```json
{
  "email": "anushka@example.com",
  "password": "123456"
}
```

### Users
GET `/api/users`

GET `/api/users/{id}`

### Animals
POST `/api/animals?ownerId=1`

GET `/api/animals`

GET `/api/animals/owner/{ownerId}`

GET `/api/animals/{id}`

## Important

This starter currently hashes passwords with BCrypt and has the project structure ready for JWT/Spring Security. JWT authentication will be added before connecting protected dashboards.
