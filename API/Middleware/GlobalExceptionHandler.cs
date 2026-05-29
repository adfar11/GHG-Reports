using Microsoft.AspNetCore.Diagnostics;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using System;
using System.Net;
using System.Threading;
using System.Threading.Tasks;

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
            _logger.LogError(exception, "Unhandled exception, {Exception}", exception.Message);
            
            var statusCode = HttpStatusCode.InternalServerError;
            var message = "An intenal server error has occured. Please try again later.";

            if (exception is ArgumentException)
            {
                statusCode = HttpStatusCode.BadRequest;
                message = exception.Message;
            }
            httpContext.Response.ContentType = "application/json"; 
            httpContext.Response.StatusCode = (int)statusCode;
           
            var errorDetails = new ErrorDetails { 
                StatusCode = httpContext.Response.StatusCode,
                Message = message,
                Detailed = _env.IsDevelopment() ? exception.ToString() : null
             };

            await httpContext.Response.WriteAsJsonAsync(errorDetails.ToString(), cancellationToken);
            return true;

        }
    }
}