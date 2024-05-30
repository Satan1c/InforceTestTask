FROM mcr.microsoft.com/dotnet/runtime:8.0 AS base
WORKDIR /app

FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
COPY . .
RUN dotnet workload update
RUN dotnet workload install aspire

FROM build AS final
RUN dotnet watch --project AppHost
ENTRYPOINT ["./AppHost"]
