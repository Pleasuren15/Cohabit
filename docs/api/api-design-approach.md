API Design Approach — REST Endpoints (SOLID, Layered, Testable)

Overview

This document outlines a pragmatic, testable design approach for implementing REST API endpoints in this repository. It assumes endpoints described in docs/api-endpoints-priority.md (file missing) but provides a generic, reusable blueprint and supporting scaffolding that can be applied to any endpoint.

Goals

- Follow SOLID principles and a clean layered architecture: Controllers → Services → DatabaseAccessors → Helpers.
- Use primary constructors where convenient and idiomatic C# syntax.
- Provide consistent try/catch/finally error handling and custom exceptions with error codes/messages.
- Add a simple, efficient caching strategy with invalidation support where appropriate.
- Propose lightweight, non-expensive logging guidance.
- Make code easily unit-testable and include example unit tests.
- Keep database interactions abstracted behind DatabaseAccessors to support different DB backends and testing.

Layers and Responsibilities

1. Controllers
- Minimal logic: validate input, map to DTOs, call Services, translate service exceptions -> HTTP responses.
- Use CancellationToken from the ASP.NET pipeline.
- Catch known custom exceptions and return appropriate status codes (404, 400, 409, 401).

2. Services
- Orchestrate business rules and transactions.
- Use DatabaseAccessors for data access; do not manipulate connection/SQL directly.
- Surface domain-friendly exceptions (custom exceptions) and avoid leaking low-level exceptions.
- Manage cache invalidation after write operations.

3. DatabaseAccessors
- Single responsibility: CRUD and queries for a single conceptual entity/table.
- Implement interfaces so they can be mocked or swapped for implementations that use EF Core, Dapper, or raw SQL.
- Keep transaction demarcation at Service level when a cross-accessor transaction is required.

4. Helpers
- Cross-cutting utilities: caching (ICache), light-weight adapters, mapping helpers, and a simple logging wrapper if needed.

Error Handling: Custom Exceptions

Create a base ApiException : System.Exception that carries an ErrorCode (string/int) and an HttpStatusCode suggestion. Subclasses for NotFound, Conflict, Validation, Unauthorized, Database errors.

Example mapping:
- NotFoundException -> 404
- ValidationException -> 400
- ConflictException -> 409
- UnauthorizedException -> 401
- ApiException (generic) or other -> 500

Caching

- Use Microsoft.Extensions.Caching.Memory (IMemoryCache) for in-process caching for read-heavy but not strongly consistent data (eg. lookups, counts, listing previews).
- TTL-based caching + manual invalidation APIs in services.
- Never cache write operations; invalidate related keys after mutating operations.
- In distributed scenarios, recommend Redis with pub/sub or keyspace notifications for invalidation.

Logging

- Use ILogger<T> from Microsoft.Extensions.Logging.
- Log levels: Information for high-level flow, Warning for expected exceptional cases, Error for unexpected exceptions with minimal payload (no PII).
- Avoid expensive structured logging for high-volume paths; prefer counters and short messages.
- When logging exceptions, log exception object (ILogger handles stack) but avoid logging entire request bodies.

Transactions, CAP and ACID

- For single-node relational operations use ACID transactions (EF Core or explicit DB transaction) in Services when multiple DatabaseAccessors are involved.
- Keep CAP in mind: where strong consistency is required (e.g., financial or availability state) prefer single-node transactions and avoid eventual consistency. For cross-service operations, document and accept eventual consistency.

Testing

- Unit tests: mock DatabaseAccessors and ICache. Test Services in isolation.
- Integration tests: run against a test database (local Docker or in-memory provider) and the real EF Core DbContext.
- Provide example unit test project layout and a sample test for an InboxService (see scaffold).

Scaffolded Implementation (example)

To demonstrate the approach, the repository now contains a small scaffold for "Inbox entries" endpoints:
- src/cohabit.api/Infrastructure/ApiExceptions.cs — custom exceptions
- src/cohabit.api/Helpers/CacheHelper.cs — ICache + MemoryCache implementation
- src/cohabit.api/DatabaseAccessors/IInboxAccessor.cs — inbox accessor interface
- src/cohabit.api/DatabaseAccessors/InMemoryInboxAccessor.cs — simple in-memory implementation for tests
- src/cohabit.api/Services/IInboxService.cs + InboxService.cs — service layer using accessor + cache
- src/cohabit.api/Controllers/InboxController.cs — controller mapping HTTP to service
- test/cohabit.api.tests/InboxServiceTests.cs — example unit tests using InMemoryInboxAccessor and MemoryCache

How to use the scaffold

- Wire up dependencies in Startup/Program: register IInboxAccessor (real implementation), IInboxService, ICache (IMemoryCache wrapper), and ILogger.
- Replace InMemoryInboxAccessor with a concrete Db-backed accessor that implements IInboxAccessor.
- Add migrations if you integrate the model into EF Core DbContext.

Notes and Rationale

- Primary constructors reduce boilerplate and make dependencies explicit.
- Keeping DatabaseAccessors minimal and testable allows fast unit tests without database dependencies.
- Custom exceptions centralize HTTP mapping and error codes for consistent semantics across controllers.
- Memory cache is used as a default; provide a Redis-backed implementation if distributed deployment is required.

Next steps

- Add concrete database accessors for prioritized endpoints from docs/api-endpoints-priority.md when that file is available.
- Instrument metrics (Prometheus, Application Insights) for latency, error rates, cache hit/miss rates.
- Add integration tests and CI jobs to run them.

End of document
