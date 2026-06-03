using Domain.Exceptions;
using FluentValidation;
using Microsoft.AspNetCore.Diagnostics;
using System.Net;


namespace API.Middleware
{
    public class GlobalExceptionHandler : IExceptionHandler
    {
        private readonly ILogger<GlobalExceptionHandler> _logger;
        private readonly IHostEnvironment _env;

        public GlobalExceptionHandler(ILogger<GlobalExceptionHandler> logger, IHostEnvironment env)
        {
            _env = env;
            _logger = logger;
        }

        public async ValueTask<bool> TryHandleAsync(
            HttpContext httpContext, Exception exception, CancellationToken cancellationToken)
        {
            _logger.LogError(exception, "Unhandled exception: {Exception}", exception.Message);
            
            // Standard-Fallback (500)
            var statusCode = HttpStatusCode.InternalServerError;
            var message = "An internal server error has occurred. Please try again later.";

            object? errors = null;  

            // Mappe spezifische Exceptions auf die richtigen HTTP-Statuscodes
                switch (exception)
                {
            case NotFoundException:
                    statusCode = HttpStatusCode.NotFound;
                    message = exception.Message;
                    break;

                // Spezifische Behandlung für FluentValidation Fehler
                case ValidationException valException:
                    statusCode = HttpStatusCode.BadRequest;
                    message = "Validierungsfehler aufgetreten.";
                    // Holt alle fehlerhaften Felder und deren Nachrichten ab
                    errors = valException.Errors
                        .GroupBy(e => e.PropertyName)
                        .ToDictionary(
                            g => g.Key,
                            g => g.Select(e => e.ErrorMessage).ToArray()
                        );
                    break;

                case BadRequestException:
                case ArgumentException:
                    statusCode = HttpStatusCode.BadRequest;
                    message = exception.Message;
                    break;
            }

            httpContext.Response.ContentType = "application/json"; 
            httpContext.Response.StatusCode = (int)statusCode;
           
            var errorDetails = new ErrorDetails 
            { 
                StatusCode = httpContext.Response.StatusCode,
                Message = message,
                Errors = errors,
                Detailed = _env.IsDevelopment() ? exception.ToString() : null
            };

            // KORREKTUR: Übergib das Objekt direkt, NICHT die .ToString() Methode!
            await httpContext.Response.WriteAsJsonAsync(errorDetails, cancellationToken);
            
            return true;
        }
    }    
}
