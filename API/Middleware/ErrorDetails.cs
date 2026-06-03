using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.Json;


namespace API.Middleware
{
    public class ErrorDetails
    {
        public int StatusCode { get; set; }
        public string Message { get; set; } = string.Empty;
        public object? Errors { get; set; } 
        public string? Detailed { get; set; } // Wird nur im Entwicklungsmodus befüllt

        public override string ToString() => JsonSerializer.Serialize(this);
    }
}