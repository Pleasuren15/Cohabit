# Clean Architecture + Vertical Slices

## Architectural Vision

This solution combines **Clean Architecture** (layered separation of concerns) with **Vertical Slices** (feature-organised code). The goal is to get the maintainability and testability of Clean Architecture without the fragmentation of traditional layered designs, where a single feature's code is scattered across many folders and projects.

---

## Clean Architecture Layers

```
┌──────────────────────────────────────────┐
│           Presentation (API)             │
│   (Controllers, Middleware, Filters)     │
├──────────────────────────────────────────┤
│           Application Layer              │
│   (Use Cases, DTOs, Port Interfaces)     │
├──────────────────────────────────────────┤
│            Domain Layer                  │
│   (Entities, Value Objects, Enums)       │
├──────────────────────────────────────────┤
│          Infrastructure Layer            │
│   (Persistence, External Services, etc)  │
└──────────────────────────────────────────┘
```

### Dependency Rule

Dependencies point **inward**. Inner layers define interfaces (ports); outer layers implement them. The API project references Application, which references Domain. Infrastructure sits at the outer ring and implements ports defined by Application/Domain.

---

## Vertical Slices — What & Why

### Problem with Traditional Layered Architecture

In a pure layered approach, a single feature (e.g. "Create Verification Request") touches:

```
Controllers/
    VerificationController.cs
Services/
    VerificationService.cs
Repositories/
    IVerificationRepository.cs
    VerificationRepository.cs
Models/
    VerificationRequest.cs
```

The feature's code is scattered horizontally. Adding or modifying a feature means touching 4+ folders across multiple projects.

### Vertical Slices Solution

Each feature owns its **complete vertical stack** — from API endpoint to domain logic to persistence — in one cohesive slice. Layers are still respected, but the organising principle is **feature**, not **layer**.

```
Features/
    CreateVerificationRequest/
        CreateVerificationRequestEndpoint.cs   (Presentation)
        CreateVerificationRequestHandler.cs    (Application)
        VerificationRequest.cs                 (Domain)
    SubmitDocument/
        SubmitDocumentEndpoint.cs
        SubmitDocumentHandler.cs
        Document.cs
```

**Benefits:**

- High cohesion — all code for a feature lives close together
- Low coupling — slices interact via well-defined shared interfaces (e.g. `IUnitOfWork`, domain events)
- Parallel work — multiple developers can own different slices without merge conflicts
- Easy to evolve — adding a new feature means adding a new slice folder, not touching 5 projects
- Easy to delete — removing a feature is a single folder deletion

---

## Project Structure Mapping

```
Cohabit/
├── src/
│   ├── cohabit.application/           ─── Application + Domain Layer
│   │   └── Features/                  ─── Vertical slices
│   │       ├── VerificationRequests/  ─── "Create Verification" slice
│   │       │   ├── Create.cs          ─── Handler, Request/Response DTOs
│   │       │   ├── Get.cs             ─── Query handler
│   │       │   └── VerificationRequest.cs  ─── Domain entity
│   │       └── Documents/
│   │           ├── Submit.cs
│   │           └── Document.cs
│   │
│   └── verification.api/              ─── Presentation Layer
│       ├── Program.cs
│       └── Features/                  ─── API-level slices (thin)
│           ├── VerificationRequests/
│           │   └── Endpoints.cs       ─── Minimal API / Controllers
│           └── Documents/
│               └── Endpoints.cs
│
├── tests/                             ─── Tests mirror the same structure
│   └── Cohabit.Verification.Api.Tests/
│       └── Features/
│           ├── VerificationRequests/
│           │   └── CreateVerificationRequestTests.cs
│           └── Documents/
│               └── SubmitDocumentTests.cs
│
└── docs/
    └── architecture-clean-vertical-slices.md
```

### What Goes Where

| Layer | Project | Responsibility |
|-------|---------|----------------|
| **Domain** | `cohabit.application` | Entities, value objects, enums, domain events, domain service interfaces. No external dependencies. |
| **Application** | `cohabit.application` | Use cases / handlers (CQRS commands & queries), DTOs, mapping, validation, port interfaces. Depends only on Domain. |
| **Presentation** | `verification.api` | Controllers, minimal API endpoints, middleware, filters. Thin layer — delegates to Application handlers. |
| **Infrastructure** | `cohabit.application` or dedicated project | Implementations of port interfaces (EF Core DbContext, repositories, external service clients). |

---

## How Slices Interact

Slices are not fully isolated islands — they share:

- **Domain primitives** — shared value objects (`Email`, `PhoneNumber`), base types (`Entity<TId>`, `IAggregateRoot`)
- **Abstractions** — `IUnitOfWork`, `IEventBus`, `ILogger<T>` — injected, not coupled
- **Cross-cutting concerns** — validation via `FluentValidation` (registered per-slice), pipeline behaviours (logging, audit, auth)

Communication between slices happens through **domain events** or **shared application services**, never through direct references to another slice's internals.

---

## Example Walkthrough — "Create Verification Request"

### 1. API Endpoint (`verification.api`)

```csharp
// Features/VerificationRequests/Endpoints.cs
public static class VerificationRequestEndpoints
{
    public static void Map(WebApplication app)
    {
        app.MapPost("/verification-requests", async (
            CreateVerificationRequest.Command command,
            ISender sender) =>
        {
            var result = await sender.Send(command);
            return result.Match(Results.Ok, Results.Problem);
        });
    }
}
```

### 2. Application Handler (`cohabit.application`)

```csharp
// Features/VerificationRequests/Create.cs
public static class CreateVerificationRequest
{
    public record Command(string ApplicantEmail, string DocumentId) : IRequest<Result<Response>>;
    public record Response(Guid Id);

    internal sealed class Handler : IRequestHandler<Command, Result<Response>>
    {
        private readonly IVerificationRequestRepository _repo;
        private readonly IUnitOfWork _uow;

        public async Task<Result<Response>> Handle(Command request, CancellationToken ct)
        {
            var request = VerificationRequest.Create(request.ApplicantEmail, request.DocumentId);
            _repo.Add(request);
            await _uow.SaveChangesAsync(ct);
            return new Response(request.Id);
        }
    }
}
```

### 3. Domain Entity (`cohabit.application` — in same slice folder)

```csharp
// Features/VerificationRequests/VerificationRequest.cs
public sealed class VerificationRequest : Entity<Guid>
{
    public string ApplicantEmail { get; private set; }
    public string DocumentId { get; private set; }
    public VerificationStatus Status { get; private set; }

    private VerificationRequest() { } // EF Core

    public static VerificationRequest Create(string email, string documentId)
    {
        // Guard clauses, validation
        return new VerificationRequest
        {
            Id = Guid.NewGuid(),
            ApplicantEmail = email,
            DocumentId = documentId,
            Status = VerificationStatus.Pending
        };
    }
}
```

---

## Testing Strategy

Because slices are self-contained, tests are simple to write and reason about:

| Test Type | What It Covers | Example |
|-----------|---------------|---------|
| **Unit** | Handler logic with mocked ports | `CreateVerificationRequestHandlerTests` — mock repository, verify entity created and saved |
| **Integration** | Handler + real DbContext + database | Spin up test container, call handler, assert row exists |
| **API** | Full HTTP round-trip | `WebApplicationFactory` — POST endpoint, assert 200 + response body |

Tests live in the same slice folder structure under `tests/`.

---

## When to Add a New Slice

1. You identify a new feature (noun + verb: "Submit Document", "Approve Verification")
2. Create a folder under `Features/` in the application project
3. Add: domain entity (or reuse existing), command/query, handler, DTOs
4. Expose via endpoint in the API project's corresponding `Features/` folder
5. Add tests in the corresponding `tests/Features/` folder

That's it. No hunting through Services, Repositories, or Models folders.

---

## Key Decisions & Trade-offs

| Decision | Rationale |
|----------|-----------|
| **Domain + Application in one project** | Avoids premature project splitting. If Domain grows large, extract to `cohabit.domain` later. |
| **MediatR / CQRS pattern** | Keeps handlers focused and testable; pipeline behaviours handle cross-cutting concerns cleanly. |
| **Minimal APIs over Controllers** | Lighter footprint; endpoint definitions stay close to their feature. Controllers still valid if preferred. |
| **FluentValidation per-slice** | Validation rules live next to the command they validate, not in a centralised folder. |
| **Result type instead of exceptions** | Explicit error handling in the handler; the endpoint maps results to HTTP responses consistently. |

---

## References

- [Clean Architecture (Martin, 2012)](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)
- [Vertical Slice Architecture (Jimmy Bogard)](https://jimmybogard.com/vertical-slice-architecture/)
- [MediatR library](https://github.com/jbogard/MediatR)
- [Cohabit repository](/)
