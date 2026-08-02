using Microsoft.AspNetCore.Mvc.ModelBinding;
using Microsoft.Extensions.Primitives;

namespace cohabit.api.Infrastructure;

public sealed class IntListModelBinderProvider : IModelBinderProvider
{
    public IModelBinder? GetBinder(ModelBinderProviderContext context)
    {
        var type = context.Metadata.ModelType;
        return type == typeof(IReadOnlyList<int>) || type == typeof(List<int>) || type == typeof(int[])
            ? new IntListModelBinder()
            : null;
    }
}

public sealed class IntListModelBinder : IModelBinder
{
    public Task BindModelAsync(ModelBindingContext bindingContext)
    {
        var modelName = bindingContext.ModelName;
        var value = bindingContext.ValueProvider.GetValue(modelName);

        if (value == ValueProviderResult.None || string.IsNullOrWhiteSpace(value.FirstValue))
        {
            bindingContext.Result = ModelBindingResult.Success(Array.Empty<int>());
            return Task.CompletedTask;
        }

        var rawValues = value.Values.Count > 0 ? value.Values : new StringValues(value.FirstValue);
        var parsed = new List<int>();

        foreach (var rawValue in rawValues)
        {
            if (string.IsNullOrEmpty(rawValue))
                continue;

            foreach (var part in rawValue.Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries))
            {
                if (int.TryParse(part, out var number))
                {
                    parsed.Add(number);
                }
                else
                {
                    bindingContext.ModelState.TryAddModelError(modelName, $"The value '{part}' is invalid.");
                    bindingContext.Result = ModelBindingResult.Failed();
                    return Task.CompletedTask;
                }
            }
        }

        bindingContext.Result = ModelBindingResult.Success(parsed.ToArray());
        return Task.CompletedTask;
    }
}
