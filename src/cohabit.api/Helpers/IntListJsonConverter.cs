using System.Text.Json;
using System.Text.Json.Serialization;

namespace cohabit.api.Helpers;

public sealed class IntListJsonConverter : JsonConverter<IReadOnlyList<int>>
{
    public override IReadOnlyList<int> Read(ref Utf8JsonReader reader, Type typeToConvert, JsonSerializerOptions options)
    {
        switch (reader.TokenType)
        {
            case JsonTokenType.Null:
                return Array.Empty<int>();

            case JsonTokenType.String:
                var raw = reader.GetString();
                if (string.IsNullOrWhiteSpace(raw))
                    return Array.Empty<int>();

                var parts = raw.Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries);
                var parsed = new List<int>();
                foreach (var part in parts)
                {
                    if (!int.TryParse(part, out var number))
                        throw new JsonException($"The value '{part}' is invalid.");
                    parsed.Add(number);
                }

                return parsed;

            case JsonTokenType.StartArray:
                return JsonSerializer.Deserialize<List<int>>(ref reader, options) ?? [];

            default:
                throw new JsonException($"Unexpected token {reader.TokenType}.");
        }
    }

    public override void Write(Utf8JsonWriter writer, IReadOnlyList<int> value, JsonSerializerOptions options)
    {
        JsonSerializer.Serialize(writer, value.ToList(), options);
    }
}
