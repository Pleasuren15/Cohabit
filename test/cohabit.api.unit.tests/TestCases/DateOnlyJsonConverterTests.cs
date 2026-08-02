using System.Text.Json;
using AwesomeAssertions;
using cohabit.api.Helpers;

namespace cohabit.api.unit.tests.TestCases;

[TestFixture]
public class DateOnlyJsonConverterTests
{
    private static readonly JsonSerializerOptions Options = new()
    {
        Converters = { new DateOnlyJsonConverter() }
    };

    [Test]
    public void Given_IsoDate_When_Deserialized_Then_ReturnsDateOnly()
    {
        var date = JsonSerializer.Deserialize<DateOnly>("\"1990-03-15\"", Options);
        date.Should().Be(new DateOnly(1990, 3, 15));
    }

    [Test]
    public void Given_IsoDateTime_When_Deserialized_Then_ReturnsDateOnly()
    {
        var date = JsonSerializer.Deserialize<DateOnly>("\"1990-03-15T00:00:00.000Z\"", Options);
        date.Should().Be(new DateOnly(1990, 3, 15));
    }

    [Test]
    public void Given_InvalidValue_When_Deserialized_Then_ThrowsJsonException()
    {
        Func<DateOnly> act = () => JsonSerializer.Deserialize<DateOnly>("\"not-a-date\"", Options);
        act.Should().Throw<JsonException>();
    }

    [Test]
    public void Given_DateOnly_When_Serialized_Then_UsesIsoDate()
    {
        var json = JsonSerializer.Serialize(new DateOnly(1990, 3, 15), Options);
        json.Should().Be("\"1990-03-15\"");
    }
}
