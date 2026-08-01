using AwesomeAssertions;
using cohabit.api.Contracts;
using cohabit.api.Controllers;
using cohabit.api.DatabaseAccessors;
using cohabit.api.Helpers;
using cohabit.api.Services;
using cohabit.api.unit.tests;
using cohabit.application.Domain;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Caching.Memory;
using NSubstitute;

namespace cohabit.api.unit.tests.TestCases;

[TestFixture]
public class ProvincesControllerTests
{
    [Test]
    public async Task Given_SeededProvinces_When_GetAllIsInvoked_Then_ReturnsOkResultWithAllProvinces()
    {
        // Arrange
        var (controller, data, _) = await CreateSystemUnderTestAsync();

        // Act
        var result = await controller.GetAll(CancellationToken.None);

        // Assert
        var provinces = Unwrap<IReadOnlyList<ProvinceDto>>(result);
        provinces.Should().HaveCount(2);
        provinces.Select(p => p.Name).Should().BeEquivalentTo([data.WesternCape.Name, data.Gauteng.Name]);
    }

    [Test]
    public async Task Given_SeededProvinces_When_GetAllIsInvoked_Then_ReadsFromProvinceCache()
    {
        // Arrange
        var (controller, _, cache) = await CreateSystemUnderTestAsync();

        // Act
        await controller.GetAll(CancellationToken.None);

        // Assert
        await cache.Received(1).GetOrSetAsync<IReadOnlyList<ProvinceDto>>(
            CacheKeys.Provinces,
            Arg.Any<Func<CancellationToken, Task<IReadOnlyList<ProvinceDto>>>>(),
            Arg.Any<TimeSpan>(),
            Arg.Any<CancellationToken>());
    }

    [Test]
    public async Task Given_Provinces_When_ServiceGetAllIsInvoked_Then_ReturnsAllProvinces()
    {
        // Arrange
        var accessor = new StaticProvinceAccessor(
        [
            Province.Create("Gauteng"),
            Province.Create("Western Cape"),
            Province.Create("Eastern Cape")
        ]);
        var service = CreateService(accessor);

        // Act
        var result = await service.GetAllAsync();

        // Assert
        result.Select(p => p.Name).Should().BeEquivalentTo(["Eastern Cape", "Gauteng", "Western Cape"]);
    }

    [Test]
    public async Task Given_Provinces_When_ServiceGetAllIsInvokedTwice_Then_ResultsAreCached()
    {
        // Arrange
        var accessor = new StaticProvinceAccessor([Province.Create("Western Cape")]);
        var service = CreateService(accessor);

        // Act
        await service.GetAllAsync();
        await service.GetAllAsync();

        // Assert
        accessor.Calls.Should().Be(1);
    }

    private static async Task<(ProvincesController Controller, TestData Data, ICache Cache)> CreateSystemUnderTestAsync()
    {
        var db = TestData.CreateDbContext();
        var data = new TestData();
        await data.SeedAsync(db);

        var cache = Substitute.For<ICache>();
        ConfigureCachePassthrough<IReadOnlyList<ProvinceDto>>(cache);

        var service = new ProvinceService(new ProvinceAccessor(db), cache);

        return (new ProvincesController(service), data, cache);
    }

    private static ProvinceService CreateService(IProvinceAccessor accessor) =>
        new(accessor, new InMemoryCache(new MemoryCache(new MemoryCacheOptions())));

    private static void ConfigureCachePassthrough<T>(ICache cache)
    {
        cache.GetOrSetAsync(
                Arg.Any<string>(),
                Arg.Any<Func<CancellationToken, Task<T>>>(),
                Arg.Any<TimeSpan>(),
                Arg.Any<CancellationToken>())
            .Returns(async callInfo =>
            {
                var factory = callInfo.Arg<Func<CancellationToken, Task<T>>>()!;
                return await factory(CancellationToken.None);
            });
    }

    private static T Unwrap<T>(ActionResult<T> result)
    {
        result.Result.Should().BeOfType<OkObjectResult>();
        var ok = (OkObjectResult)result.Result!;
        ok.Value!.Should().BeAssignableTo<T>();
        return (T)ok.Value!;
    }

    private sealed class StaticProvinceAccessor(IReadOnlyList<Province> provinces) : IProvinceAccessor
    {
        public int Calls { get; private set; }

        public Task<IReadOnlyList<Province>> GetAllAsync(CancellationToken ct = default)
        {
            Calls++;
            return Task.FromResult(provinces);
        }
    }
}
