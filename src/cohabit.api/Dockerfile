# Build from the repository root:
#   docker build -f src/cohabit.api/Dockerfile -t cohabit-api .

FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
ARG BUILD_CONFIGURATION=Release
WORKDIR /src
COPY ["src/cohabit.api/cohabit.api.csproj", "src/cohabit.api/"]
COPY ["src/cohabit.application/cohabit.application.csproj", "src/cohabit.application/"]
RUN dotnet restore "src/cohabit.api/cohabit.api.csproj"
COPY . .
WORKDIR "/src/src/cohabit.api"
RUN dotnet build "./cohabit.api.csproj" -c $BUILD_CONFIGURATION -o /app/build

FROM build AS publish
ARG BUILD_CONFIGURATION=Release
RUN dotnet publish "./cohabit.api.csproj" -c $BUILD_CONFIGURATION -o /app/publish /p:UseAppHost=false

FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS final
USER $APP_UID
WORKDIR /app
EXPOSE 8080
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "cohabit.api.dll"]