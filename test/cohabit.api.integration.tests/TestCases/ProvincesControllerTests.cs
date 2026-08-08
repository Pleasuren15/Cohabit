using AwesomeAssertions;
using cohabit.api.Contracts;
using cohabit.api.integration.tests.Helpers;
using cohabit.api.integration.tests.Infrastructure;
using Microsoft.EntityFrameworkCore;
using System.Net;
using System.Net.Http.Json;

namespace cohabit.api.integration.tests.TestCases;

[TestFixture]
public class ProvincesControllerTests : ApiTestBase
{
    [Test]
    public async Task Given_SeededProvinces_When_GetAllIsInvoked_Then_ReturnsAllProvinces()
    {
        // Arrange
        // Provinces are seeded by the application at startup (LookupSeedManager).

        // Act
        var response = await Client.GetAsync("/api/provinces");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);
        var provinces = await response.Content.ReadFromJsonAsync<List<ProvinceDto>>();
        provinces!.Select(p => p.Name).Should().Contain(["Western Cape", "Gauteng", "KwaZulu-Natal"]);
    }

    [Test]
    public async Task Given_SeededProvinces_When_GetAllIsInvoked_Then_ReturnsProvincesInNameOrder()
    {
        // Arrange
        await using var db = TestDbContext.Create();
        var expected = await db.Provinces.OrderBy(p => p.Name).Select(p => p.Name).ToListAsync();

        // Act
        var response = await Client.GetAsync("/api/provinces");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);
        var provinces = await response.Content.ReadFromJsonAsync<List<ProvinceDto>>();
        provinces!.Select(p => p.Name).Should().Equal(expected);
    }
}
