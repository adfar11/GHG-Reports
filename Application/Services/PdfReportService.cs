using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Application.CarbonReports.Dtos;
using Application.Interfaces;
using QuestPDF.Fluent;
using QuestPDF.Helpers;
using QuestPDF.Infrastructure;

namespace Application.Services
{
    public class PdfReportService : IPdfReportService
    {
        public byte[] GeneratePdfReport(CarbonReportDto report, int? filteredMonth)
        {
            // QuestPDF Open-Source-Community-Lizenz setzen
            QuestPDF.Settings.License = LicenseType.Community;

            // 1. Alle eindeutigen Kategorienamen ermitteln (für die Tabellenspalten)
            var alleKategorien = report.MonthlyEmissions
                .SelectMany(m => m.Categories.Keys)
                .Distinct()
                .ToList();

            // 2. Gesamtsummen pro Kategorie für den Tabellen-Footer berechnen
            var kategorieSummen = alleKategorien.ToDictionary(
                kat => kat,
                kat => report.MonthlyEmissions.Sum(m => m.Categories.TryGetValue(kat, out var wert) ? wert : 0.0)
            );

            // 3. Dynamischen Titel festlegen
            string titel = filteredMonth.HasValue 
                ? $"CO₂-Emission report – {report.MonthlyEmissions.FirstOrDefault()?.MonthName} {report.Year}" 
                : $"CO₂-Yearly report – Overview {report.Year}";

            // 4. PDF Dokument erzeugen
            return Document.Create(container =>
            {
                container.Page(page =>
                {
                    // Da Spalten dynamisch sind, nutzen wir das Querformat (Landscape)
                    page.Size(PageSizes.A4.Landscape());
                    page.Margin(1.5f, Unit.Centimetre);
                    page.DefaultTextStyle(x => x.FontSize(9).FontFamily("Arial"));

                    // --- HEADER ---
                    page.Header().Column(col =>
                    {
                        col.Item().Text(titel).SemiBold().FontSize(20).FontColor(Colors.Green.Darken3);
                        col.Item().PaddingVertical(5).LineHorizontal(1).LineColor(Colors.Grey.Lighten1);
                    });

                    // --- INHALT (TABELLE) ---
                    page.Content().PaddingVertical(1, Unit.Centimetre).Table(table =>
                    {
                        // Spalten-Definition: 1x Monat, X-mal Kategorien, 1x Gesamt
                        table.ColumnsDefinition(columns =>
                        {
                            columns.RelativeColumn(2); // Monat
                            foreach (var kat in alleKategorien)
                            {
                                columns.RelativeColumn(1.5f); // Dynamische Spalten
                            }
                            columns.RelativeColumn(1.5f); // Gesamt
                        });

                        // Tabellen-Kopfzeile
                        table.Header(header =>
                        {
                            var headerStyle = TextStyle.Default.FontColor(Colors.White).Bold();
                            
                            header.Cell().Background(Colors.Green.Darken3).Padding(5).Text("Month").Style(headerStyle);
                            foreach (var kat in alleKategorien)
                            {
                                header.Cell().Background(Colors.Green.Darken3).Padding(5).Text(kat).Style(headerStyle);
                            }
                            header.Cell().Background(Colors.Green.Darken3).Padding(5).Text("Total CO₂e").Style(headerStyle);
                        });

                        // Datenzeilen befüllen (Monate)
                        foreach (var monat in report.MonthlyEmissions)
                        {
                            var borderStyle = Colors.Grey.Lighten2;

                            table.Cell().BorderBottom(1).BorderColor(borderStyle).Padding(5).Text(monat.MonthName);
                            
                            // Dynamisch die Werte aus dem Dictionary auslesen
                            foreach (var kat in alleKategorien)
                            {
                                double wert = monat.Categories.TryGetValue(kat, out var w) ? w : 0.0;
                                table.Cell().BorderBottom(1).BorderColor(borderStyle).Padding(5).Text($"{wert:N2}");
                            }

                            // Monatliche Gesamtsumme
                            table.Cell().BorderBottom(1).BorderColor(borderStyle).Padding(5).Text($"{monat.MonthlyTotalCO2e:N2}").Bold();
                        }

                        // --- SUMMENZEILE (FOOTER) ---
                        var footerBg = Colors.Grey.Lighten3;

                        table.Cell().Background(footerBg).Padding(5).Text(filteredMonth.HasValue ? "SumValue" : "Sum Total").Bold();
                        foreach (var kat in alleKategorien)
                        {
                            double summe = kategorieSummen[kat];
                            table.Cell().Background(footerBg).Padding(5).Text($"{summe:N2}").Bold();
                        }
                        
                        // Das absolute Endergebnis unten rechts (grün hinterlegt)
                        table.Cell().Background(Colors.Green.Lighten5).Padding(5).Text($"{report.TotalCO2e:N2}").Bold().FontColor(Colors.Green.Darken4);
                    });

                    // --- SEITENZAHLEN ---
                    page.Footer().AlignCenter().Text(x =>
                    {
                        x.Span("Seite ");
                        x.CurrentPageNumber();
                        x.Span(" von ");
                        x.TotalPages();
                    });
                });
            }).GeneratePdf(); // Gibt das PDF als byte[] zurück
        }
    }
}
