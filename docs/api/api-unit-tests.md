---
name: controller-unit-test-workflow
description: "Use when you need to create unit tests for ASP.NET Core controllers by tracing dependencies from the entry-point controller to the last return point, creating NSubstitute stubs, building a system under test, and writing Given_When_Then tests with Arrange/Act/Assert sections and AwesomeAssertions."
---

# Controller Unit Test Workflow

Use this skill when you are adding or extending unit tests for an ASP.NET Core controller in this repository.

## Goal

Create a reliable controller unit test suite that:
- traces dependencies from the controller entry point to the last return point,
- creates stubs with NSubstitute,
- builds a system under test,
- writes tests with the Given_When_Then naming style,
- uses Arrange / Act / Assert sections inside each test,
- asserts with AwesomeAssertions.

## Required workflow

1. Identify the controller entry point
   - Start with the controller action method under test.
   - Trace the dependency chain from that action to the last return point.
   - Record the collaborators that are invoked directly or indirectly.

2. Map dependencies to test seams
   - Determine which dependencies should be stubbed.
   - Prefer interfaces and abstractions that can be replaced with NSubstitute.
   - Keep the test focused on controller behavior rather than implementation details.

3. Create stubs with NSubstitute
   - Create substitute instances for each required dependency.
   - Configure return values and behaviors explicitly.
   - Ensure the stub setup reflects the real contract the controller expects.

4. Build the system under test
   - Instantiate the controller with the substituted dependencies.
   - If the controller requires additional context such as HttpContext, claims, or route data, supply the minimum necessary values.
   - Keep the setup minimal and readable.

5. Write the test case
   - Name the test using the Given_When_Then style, for example:
     - `Given_ValidRequest_When_ActionIsInvoked_Then_ReturnsOkResult()`
   - Structure the test body with these sections in order:
     - `// Arrange`
     - `// Act`
     - `// Assert`

6. Assert with AwesomeAssertions
   - Use `Should().Be...` style assertions.
   - Prefer assertions that verify observable behavior and returned values.
   - Avoid asserting on implementation internals unless the behavior depends on them.

## Test conventions

- Use descriptive Given_When_Then test names.
- Keep each test focused on one behavior.
- Use NSubstitute for collaborator stubs and mocks.
- Use the real controller logic under test.
- Use AwesomeAssertions for assertions.
- Prefer clear, explicit setup over over-mocking.

## Quality checklist

Before considering the work complete, verify:
- The controller action and its dependency chain were traced.
- All required collaborators are stubbed with NSubstitute.
- The system under test is created cleanly and minimally.
- Each test uses the Given_When_Then naming convention.
- Each test contains Arrange / Act / Assert sections.
- Assertions use AwesomeAssertions.
- The test targets observable controller behavior.

## Example prompt to trigger this skill

- "Create unit tests for this controller using the controller-unit-test-workflow skill."
- "Trace the dependencies from the controller action to the last return point, create NSubstitute stubs, and write Given_When_Then tests with Arrange/Act/Assert and AwesomeAssertions."
