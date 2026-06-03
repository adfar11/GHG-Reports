using Application.Behaviors;
using FluentValidation;
using MediatR;
using Microsoft.Extensions.DependencyInjection;
using System.Reflection;

public static class DependencyInjection
{
    public static IServiceCollection AddApplication(this IServiceCollection services)
    {
        var assembly = Assembly.GetExecutingAssembly();

        // 1. Registriert MediatR (falls noch nicht geschehen)
        services.AddMediatR(configuration => {
            configuration.RegisterServicesFromAssembly(assembly);
            
            // 2. Das ValidationBehavior als offenes Generikum hinzufügen
            configuration.AddOpenBehavior(typeof(ValidationBehavior<,>));
        });

        // 3. Registriert automatisch alle FluentValidation-Klassen (wie deinen CreateEmissionRecordCommandValidator)
        services.AddValidatorsFromAssembly(assembly);

        return services;
    }
}
