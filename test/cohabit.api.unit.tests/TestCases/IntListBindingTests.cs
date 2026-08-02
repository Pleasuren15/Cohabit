using System.Globalization;
using System.Text.Json;
using AwesomeAssertions;
using cohabit.api.Helpers;
using cohabit.api.Infrastructure;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Abstractions;
using Microsoft.AspNetCore.Mvc.ModelBinding;
using Microsoft.AspNetCore.Mvc.ModelBinding.Metadata;
using Microsoft.AspNetCore.Routing;
using Microsoft.Extensions.Primitives;

namespace cohabit.api.unit.tests.TestCases;

[TestFixture]
public class IntListBindingTests
{
    private static readonly JsonSerializerOptions JsonOptions = new()
    {
        Converters = { new IntListJsonConverter() }
    };

    [Test]
    public async Task Given_EmptyFormValue_When_BindModelIsInvoked_Then_ReturnsEmptyList()
    {
        var result = await BindAsync(new Dictionary<string, StringValues> { ["RuleIds"] = "" });

        result.IsModelSet.Should().BeTrue();
        ((IReadOnlyList<int>)result.Model!).Should().BeEmpty();
    }

    [Test]
    public async Task Given_MissingFormValue_When_BindModelIsInvoked_Then_ReturnsEmptyList()
    {
        var result = await BindAsync(new Dictionary<string, StringValues>());

        result.IsModelSet.Should().BeTrue();
        ((IReadOnlyList<int>)result.Model!).Should().BeEmpty();
    }

    [Test]
    public async Task Given_CommaSeparatedValue_When_BindModelIsInvoked_Then_ReturnsParsedList()
    {
        var result = await BindAsync(new Dictionary<string, StringValues> { ["RuleIds"] = "1,2,3" });

        result.IsModelSet.Should().BeTrue();
        ((IReadOnlyList<int>)result.Model!).Should().BeEquivalentTo([1, 2, 3]);
    }

    [Test]
    public async Task Given_RepeatedFormValues_When_BindModelIsInvoked_Then_ReturnsParsedList()
    {
        var result = await BindAsync(new Dictionary<string, StringValues> { ["RuleIds"] = new[] { "1", "2" } });

        result.IsModelSet.Should().BeTrue();
        ((IReadOnlyList<int>)result.Model!).Should().BeEquivalentTo([1, 2]);
    }

    [Test]
    public async Task Given_InvalidValue_When_BindModelIsInvoked_Then_ReturnsFailureWithModelStateError()
    {
        var context = CreateContext(new Dictionary<string, StringValues> { ["RuleIds"] = "abc" });
        var binder = new IntListModelBinder();

        await binder.BindModelAsync(context);

        context.Result.IsModelSet.Should().BeFalse();
        context.ModelState.ErrorCount.Should().Be(1);
    }

    [Test]
    public void Given_EmptyJsonString_When_Deserialized_Then_ReturnsEmptyList()
    {
        var list = JsonSerializer.Deserialize<IReadOnlyList<int>>("\"\"", JsonOptions);
        list.Should().BeEmpty();
    }

    [Test]
    public void Given_JsonArray_When_Deserialized_Then_ReturnsParsedList()
    {
        var list = JsonSerializer.Deserialize<IReadOnlyList<int>>("[1,2,3]", JsonOptions);
        list.Should().BeEquivalentTo([1, 2, 3]);
    }

    [Test]
    public void Given_CommaSeparatedJsonString_When_Deserialized_Then_ReturnsParsedList()
    {
        var list = JsonSerializer.Deserialize<IReadOnlyList<int>>("\"1,2,3\"", JsonOptions);
        list.Should().BeEquivalentTo([1, 2, 3]);
    }

    [Test]
    public void Given_InvalidJsonString_When_Deserialized_Then_ThrowsJsonException()
    {
        Func<IReadOnlyList<int>> act = () => JsonSerializer.Deserialize<IReadOnlyList<int>>("\"abc\"", JsonOptions);
        act.Should().Throw<JsonException>();
    }

    private static async Task<ModelBindingResult> BindAsync(Dictionary<string, StringValues> form)
    {
        var context = CreateContext(form);
        var binder = new IntListModelBinder();
        await binder.BindModelAsync(context);
        return context.Result;
    }

    private static DefaultModelBindingContext CreateContext(Dictionary<string, StringValues> form)
    {
        var formCollection = new FormCollection(form);
        var valueProvider = new FormValueProvider(BindingSource.Form, formCollection, CultureInfo.InvariantCulture);

        return new DefaultModelBindingContext
        {
            ActionContext = new ActionContext(new DefaultHttpContext(), new RouteData(), new ActionDescriptor()),
            ModelMetadata = new EmptyModelMetadataProvider().GetMetadataForType(typeof(IReadOnlyList<int>)),
            ModelName = "RuleIds",
            ModelState = new ModelStateDictionary(),
            ValueProvider = valueProvider,
            BindingSource = BindingSource.Form
        };
    }
}
