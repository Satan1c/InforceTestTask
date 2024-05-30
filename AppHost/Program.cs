using Projects;

var builder = DistributedApplication.CreateBuilder(args);

var postgres = builder.AddPostgres("NpgsqlConnection").AddDatabase("shortenerdb", "shortener");
var api      = builder.AddProject<Api>("api").WithReference(postgres).WithExternalHttpEndpoints();

builder.AddNpmApp("front", "../Web").WithReference(api).WithHttpEndpoint(env: "PORT").WithExternalHttpEndpoints().PublishAsDockerFile();

builder.Build().Run();
