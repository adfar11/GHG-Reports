using Application;
using Persistence;
using FluentValidation;
using Application.CarbonReports.Commands;
using API.Middleware;
using Application.Interfaces;
using Application.Services;

var builder = WebApplication.CreateBuilder(args);

// KORREKTUR: Scannt alle referenzierten Schichten (Domain, Application, Persistence) 
// nach Controllern, um den 404-Fehler zu beheben
builder.Services.AddRouting(options => options.LowercaseUrls = true);


// Registriert automatisch ALLE Validatoren, die sich in dieser Assembly befinden
builder.Services.AddValidatorsFromAssembly(typeof(CreateEmissionRecordCommandValidator).Assembly);


var apiControllers = builder.Services.AddControllers();
builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        // ✅ Erlaubt es dem Backend, Strings wie "BatteryElectric" automatisch in das Enum zu konvertieren
        options.JsonSerializerOptions.Converters.Add(new System.Text.Json.Serialization.JsonStringEnumConverter());
    });



foreach (var assembly in AppDomain.CurrentDomain.GetAssemblies())
{
    apiControllers.AddApplicationPart(assembly);
}

builder.Services.AddOpenApi();
builder.Services.Configure<RouteOptions>(options => options.LowercaseUrls = true);
builder.Services.AddApplication();
builder.Services.AddPersistence(
    connectionString: builder.Configuration.GetConnectionString("DefaultConnection")!);

builder.Services.AddCors(options =>
{
    options.AddPolicy("ReactApp", policy =>
    {
        policy.WithOrigins("http://localhost:3000", "http://localhost:5173", "http://127.0.0.1:5173")
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

builder.Services.AddExceptionHandler<GlobalExceptionHandler>();
builder.Services.AddProblemDetails();

// PDf Injection 
builder.Services.AddTransient<IPdfReportService, PdfReportService>(); 

var app = builder.Build();
// ... (der restliche Middleware-Code der Program.cs bleibt identisch)


// WICHTIG: Routing-Middleware explizit aktivieren (löst den 405-Konflikt)
app.UseRouting();

app.UseCors("ReactApp");
app.UseAuthorization();

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

// Controller Endpunkte mappen
app.MapControllers();
app.UseExceptionHandler();

app.Run();
