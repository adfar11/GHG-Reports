using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Domain.Exceptions
{
    public class NotFoundException : CustomException
    {
        public NotFoundException(string message) : base(message) { }

            // Hilfs-Konstruktor für typisierte Fehlermeldungen (z.B. "Facility mit ID ... wurde nicht gefunden.")
        public NotFoundException(string entityName, object key) 
            : base($"{entityName} mit der ID '{key}' wurde nicht gefunden.") { }
    }

}