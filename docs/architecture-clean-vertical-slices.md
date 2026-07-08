# Clean Architecture + Vertical Slices

## Architectural Vision

This approach combines **Clean Architecture** (layered separation of concerns) with **Vertical Slices** (feature-organised code). The goal is to get the maintainability and testability of Clean Architecture without the fragmentation of traditional layered designs, where a single feature's code is scattered across many folders and projects.

---

## Clean Architecture Layers

```
+------------------------------------------+
|           Presentation (API)             |
|   (Controllers, Middleware, Filters)     |
+------------------------------------------+
|           Application Layer              |
|   (Use Cases, DTOs, Port Interfaces)     |
+------------------------------------------+
|            Domain Layer                  |
|   (Entities, Value Objects, Enums)       |
+------------------------------------------+
|          Infrastructure Layer            |
|   (Persistence, External Services, etc)  |
+------------------------------------------+
```

### Dependency Rule

Dependencies point **inward**. Inner layers define interfaces (ports); outer layers implement them. The API project references Application, which references Domain. Infrastructure sits at the outer ring and implements ports defined by Application/Domain.

---

## Vertical Slices

### Problem with Traditional Layered Architecture

In a pure layered approach, a single feature (e.g. "Place Order") touches:

```
Controllers/
    OrderController.cs
Services/
    OrderService.cs
Repositories/
    IOrderRepository.cs
    OrderRepository.cs
Models/
    Order.cs
```

The feature's code is scattered horizontally. Adding or modifying a feature means touching 4+ folders across multiple projects.

### Vertical Slices Solution

Each feature owns its **complete vertical stack** — from API endpoint to domain logic to persistence — in one cohesive slice. Layers are still respected, but the organising principle is **feature**, not **layer**.

```
Features/
    PlaceOrder/
        PlaceOrderEndpoint.cs     (Presentation)
        PlaceOrderHandler.cs      (Application)
        Order.cs                  (Domain)
    CancelOrder/
        CancelOrderEndpoint.cs
        CancelOrderHandler.cs
```

**Benefits:**

- High cohesion — all code for a feature lives close together
- Low coupling — slices interact via well-defined shared interfaces (e.g. `IUnitOfWork`, domain events)
- Parallel work — multiple developers can own different slices without merge conflicts
- Easy to evolve — adding a new feature means adding a new slice folder, not touching 5 projects
- Easy to delete — removing a feature is a single folder deletion

---

## Project Structure

```
Solution/
+-- src/
|   +-- MyApp.Application/              --- Application + Domain Layer
|   |   +-- Features/                   --- Vertical slices
|   |       +-- Orders/                 --- "Orders" feature slice
|   |       |   +-- PlaceOrder.cs       --- Handler, Request/Response DTOs
|   |       |   +-- GetOrder.cs         --- Query handler
|   |       |   +-- Order.cs            --- Domain entity
|   |       +-- Payments/
|   |           +-- ProcessPayment.cs
|   |           +-- Payment.cs
|   |
|   +-- MyApp.Api/                      --- Presentation Layer
|       +-- Program.cs
|       +-- Features/                   --- API-level slices (thin)
|           +-- Orders/
|           |   +-- Endpoints.cs        --- Minimal API / Controllers
|           +-- Payments/
|               +-- Endpoints.cs
|
+-- tests/                              --- Tests mirror the same structure
|   +-- MyApp.Api.Tests/
|       +-- Features/
|           +-- Orders/
|           |   +-- PlaceOrderTests.cs
|           +-- Payments/
|               +-- ProcessPaymentTests.cs
|
+-- docs/
    +-- architecture-clean-vertical-slices.md
```

### What Goes Where

| Layer | Project | Responsibility |
|-------|---------|----------------|
| **Domain** | `MyApp.Application` | Entities, value objects, enums, domain events, domain service interfaces. No external dependencies. |
| **Application** | `MyApp.Application` | Use cases / handlers (CQRS commands & queries), DTOs, mapping, validation, port interfaces. Depends only on Domain. |
| **Presentation** | `MyApp.Api` | Controllers, minimal API endpoints, middleware, filters. Thin layer — delegates to Application handlers. |
| **Infrastructure** | `MyApp.Application` or dedicated project | Implementations of port interfaces (EF Core DbContext, repositories, external service clients). |

---

## How Slices Interact

Slices are not fully isolated islands — they share:

- **Domain primitives** — shared value objects (`Email`, `PhoneNumber`), base types (`Entity<TId>`, `IAggregateRoot`)
- **Abstractions** — `IUnitOfWork`, `IEventBus`, `ILogger<T>` — injected, not coupled
- **Cross-cutting concerns** — validation (registered per-slice), pipeline behaviours (logging, audit, auth)

Communication between slices happens through **domain events** or **shared application services**, never through direct references to another slice's internals.

---

## Example Walkthrough — "Place Order"

### 1. API Endpoint

```csharp
// Features/Orders/Endpoints.cs
public static class OrderEndpoints
{
    public static void Map(WebApplication app)
    {
        app.MapPost("/orders", async (
            PlaceOrder.Command command,
            PlaceOrderHandler handler,
            CancellationToken ct) =>
        {
            var result = await handler.HandleAsync(command, ct);
            return Results.Ok(result);
        });
    }
}
```

### 2. Application Handler

```csharp
// Features/Orders/PlaceOrder.cs
public static class PlaceOrder
{
    public sealed record Command(string CustomerId, List<OrderItem> Items);
    public sealed record Response(Guid OrderId);
}

public sealed class PlaceOrderHandler(IOrderRepository repo, IUnitOfWork uow)
{
    public async Task<PlaceOrder.Response> HandleAsync(PlaceOrder.Command command, CancellationToken ct)
    {
        var order = Order.Create(command.CustomerId, command.Items);
        repo.Add(order);
        await uow.SaveChangesAsync(ct);
        return new PlaceOrder.Response(order.Id);
    }
}
```

### 3. Domain Entity (same slice folder)

```csharp
// Features/Orders/Order.cs
public sealed class Order : Entity<Guid>
{
    public string CustomerId { get; private set; }
    public OrderStatus Status { get; private set; }
    public IReadOnlyList<OrderItem> Items { get; private set; }

    private Order() { } // EF Core

    public static Order Create(string customerId, List<OrderItem> items)
    {
        return new Order
        {
            Id = Guid.NewGuid(),
            CustomerId = customerId,
            Items = items,
            Status = OrderStatus.Pending
        };
    }
}
```

---

## Testing Strategy

Because slices are self-contained, tests are simple to write and reason about:

| Test Type | What It Covers | Example |
|-----------|---------------|---------|
| **Unit** | Handler logic with mocked ports | Mock repository, verify entity created and saved |
| **Integration** | Handler + real DbContext + database | Spin up test container, call handler, assert row exists |
| **API** | Full HTTP round-trip | `WebApplicationFactory` — POST endpoint, assert 200 + response body |

Tests live in the same slice folder structure under `tests/`.

---

## When to Add a New Slice

1. Identify a new feature (noun + verb: "Place Order", "Cancel Subscription")
2. Create a folder under `Features/` in the application project
3. Add: domain entity (or reuse existing), command/query, handler, DTOs
4. Expose via endpoint in the API project's corresponding `Features/` folder
5. Add tests in the corresponding `tests/Features/` folder

No hunting through Services, Repositories, or Models folders.

---

## Key Decisions & Trade-offs

| Decision | Rationale |
|----------|-----------|
| **Domain + Application in one project** | Avoids premature project splitting. If Domain grows large, extract to a dedicated project later. |
| **CQRS pattern** | Keeps handlers focused and testable; pipeline behaviours handle cross-cutting concerns cleanly. |
| **Minimal APIs over Controllers** | Lighter footprint; endpoint definitions stay close to their feature. Controllers still valid if preferred. |
| **Validation per-slice** | Validation rules live next to the command they validate, not in a centralised folder. |
| **Result type instead of exceptions** | Explicit error handling in the handler; the endpoint maps results to HTTP responses consistently. |

---

## References

- [Clean Architecture (Martin, 2012)](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)
- [Vertical Slice Architecture (Jimmy Bogard)](https://jimmybogard.com/vertical-slice-architecture/)
