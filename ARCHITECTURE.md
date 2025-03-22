# Application Architecture

## Overview

The `myfin` application is composed of multiple services orchestrated via Docker Compose. The key components include:

- **myfin-frontend:** Serves the user interface.
- **myfin-backend:** Exposes API endpoints and handles business logic.
- **db:** Provides persistent data storage (configured with MySQL).

## Sequence Diagram

```mermaid
sequenceDiagram
    participant C as Browser Client
    participant F as myfin-frontend
    participant B as myfin-backend (API)
    participant D as Database (MySQL)

    C->>F: Request Application UI
    F->>B: API call for data
    B->>D: Execute DB query
    D-->>B: Return query results
    B-->>F: API response
    F-->>C: Render UI with data
```

## Flow Diagram

```mermaid
flowchart TD
    A[docker-compose.yml] --> B[myfin-frontend]
    A --> C[myfin-backend]
    A --> D[db]

    B --> C
    C --> D
    C --> B
```

## Docker Compose Configuration

The project's `docker-compose.yml` file not only defines the services but also sets environment variables for configuration (e.g., database and application settings). Refer to the Docker Compose file for detailed configurations.

---

This documentation provides a clear overview of the system's components and their interactions, helping both current and future developers to understand the architecture of the myfin application.
