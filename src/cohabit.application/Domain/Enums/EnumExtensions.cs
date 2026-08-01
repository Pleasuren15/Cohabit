using System.ComponentModel;
using System.Reflection;

namespace cohabit.application.Domain.Enums;

public static class EnumExtensions
{
    public static string GetDescription<TEnum>(this TEnum value) where TEnum : struct, Enum
    {
        var field = typeof(TEnum).GetField(value.ToString())
            ?? throw new InvalidOperationException($"Enum member '{value}' could not be resolved.");
        return field.GetCustomAttribute<DescriptionAttribute>()?.Description ?? value.ToString();
    }
}
