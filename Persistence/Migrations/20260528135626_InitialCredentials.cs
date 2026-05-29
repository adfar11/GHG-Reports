using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace Persistence.Migrations
{
    /// <inheritdoc />
    public partial class InitialCredentials : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "EmissionCategories",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "TEXT", nullable: false),
                    Name = table.Column<string>(type: "TEXT", nullable: false),
                    Scope = table.Column<int>(type: "INTEGER", nullable: false),
                    CO2Factor = table.Column<double>(type: "REAL", precision: 18, scale: 4, nullable: false),
                    Unit = table.Column<string>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_EmissionCategories", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Vehicles",
                columns: table => new
                {
                    VehicleId = table.Column<Guid>(type: "TEXT", nullable: false),
                    Name = table.Column<string>(type: "TEXT", nullable: false),
                    LicensePlate = table.Column<string>(type: "TEXT", nullable: false),
                    Type = table.Column<int>(type: "INTEGER", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Vehicles", x => x.VehicleId);
                });

            migrationBuilder.CreateTable(
                name: "EmissionRecords",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "TEXT", nullable: false),
                    EmissionCategoryId = table.Column<Guid>(type: "TEXT", nullable: false),
                    Quantity = table.Column<double>(type: "REAL", precision: 18, scale: 2, nullable: false),
                    ConsumptionDate = table.Column<DateTime>(type: "TEXT", nullable: false),
                    Description = table.Column<string>(type: "TEXT", nullable: false),
                    VehicleId = table.Column<Guid>(type: "TEXT", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_EmissionRecords", x => x.Id);
                    table.ForeignKey(
                        name: "FK_EmissionRecords_EmissionCategories_EmissionCategoryId",
                        column: x => x.EmissionCategoryId,
                        principalTable: "EmissionCategories",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_EmissionRecords_Vehicles_VehicleId",
                        column: x => x.VehicleId,
                        principalTable: "Vehicles",
                        principalColumn: "VehicleId");
                });

            migrationBuilder.InsertData(
                table: "EmissionCategories",
                columns: new[] { "Id", "CO2Factor", "Name", "Scope", "Unit" },
                values: new object[,]
                {
                    { new Guid("11111111-1111-1111-1111-111111111111"), 0.41999999999999998, "Stromnetz (Standard)", 2, "kWh" },
                    { new Guid("11111111-2222-3333-4444-555555555555"), 0.35999999999999999, "Stromnetz (Standard)", 2, "kWh" },
                    { new Guid("22222222-1111-1111-1111-222222222222"), 2.6400000000000001, "Fuhrpark (Diesel)", 1, "Liters" },
                    { new Guid("22222222-2222-2222-2222-222222222222"), 2.5, "Fuhrpark (Benzin)", 1, "Liters" }
                });

            migrationBuilder.InsertData(
                table: "Vehicles",
                columns: new[] { "VehicleId", "LicensePlate", "Name", "Type" },
                values: new object[,]
                {
                    { new Guid("33333333-1111-1111-1111-333333333333"), "WOB-P 123", "VW Golf GTE", 2 },
                    { new Guid("33333333-2222-2222-2222-333333333333"), "WOB-E 999", "Tesla Model 3", 1 }
                });

            migrationBuilder.InsertData(
                table: "EmissionRecords",
                columns: new[] { "Id", "ConsumptionDate", "Description", "EmissionCategoryId", "Quantity", "VehicleId" },
                values: new object[,]
                {
                    { new Guid("a1111111-0000-0000-0000-000000000001"), new DateTime(2026, 1, 15, 0, 0, 0, 0, DateTimeKind.Unspecified), "Strom Jan", new Guid("11111111-1111-1111-1111-111111111111"), 4200.0, null },
                    { new Guid("a1111111-0000-0000-0000-000000000002"), new DateTime(2026, 2, 15, 0, 0, 0, 0, DateTimeKind.Unspecified), "Strom Feb", new Guid("11111111-2222-3333-4444-555555555555"), 3900.0, null },
                    { new Guid("a1111111-0000-0000-0000-000000000003"), new DateTime(2026, 3, 15, 0, 0, 0, 0, DateTimeKind.Unspecified), "Strom Mär", new Guid("11111111-2222-3333-4444-555555555555"), 4500.0, null },
                    { new Guid("a1111111-0000-0000-0000-000000000004"), new DateTime(2026, 4, 15, 0, 0, 0, 0, DateTimeKind.Unspecified), "Strom Apr", new Guid("11111111-1111-1111-1111-111111111111"), 3100.0, null },
                    { new Guid("a2222222-0000-0000-0000-000000000001"), new DateTime(2026, 1, 15, 0, 0, 0, 0, DateTimeKind.Unspecified), "Diesel Jan", new Guid("22222222-1111-1111-1111-222222222222"), 1100.0, null },
                    { new Guid("a2222222-0000-0000-0000-000000000002"), new DateTime(2026, 2, 15, 0, 0, 0, 0, DateTimeKind.Unspecified), "Diesel Feb", new Guid("22222222-2222-2222-2222-222222222222"), 950.0, null },
                    { new Guid("a2222222-0000-0000-0000-000000000003"), new DateTime(2026, 3, 15, 0, 0, 0, 0, DateTimeKind.Unspecified), "Diesel Mär", new Guid("22222222-1111-1111-1111-222222222222"), 1300.0, null },
                    { new Guid("a2222222-0000-0000-0000-000000000004"), new DateTime(2026, 4, 15, 0, 0, 0, 0, DateTimeKind.Unspecified), "Diesel Apr", new Guid("22222222-2222-2222-2222-222222222222"), 1200.0, null }
                });

            migrationBuilder.CreateIndex(
                name: "IX_EmissionRecords_EmissionCategoryId",
                table: "EmissionRecords",
                column: "EmissionCategoryId");

            migrationBuilder.CreateIndex(
                name: "IX_EmissionRecords_VehicleId",
                table: "EmissionRecords",
                column: "VehicleId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "EmissionRecords");

            migrationBuilder.DropTable(
                name: "EmissionCategories");

            migrationBuilder.DropTable(
                name: "Vehicles");
        }
    }
}
