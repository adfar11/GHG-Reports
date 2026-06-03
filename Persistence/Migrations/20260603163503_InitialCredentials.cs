using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

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
                    Name = table.Column<string>(type: "TEXT", maxLength: 150, nullable: false),
                    Scope = table.Column<int>(type: "INTEGER", nullable: false),
                    CO2Factor = table.Column<double>(type: "REAL", nullable: false),
                    Unit = table.Column<string>(type: "TEXT", maxLength: 20, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_EmissionCategories", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Facilities",
                columns: table => new
                {
                    FacilityId = table.Column<Guid>(type: "TEXT", nullable: false),
                    FacilityName = table.Column<string>(type: "TEXT", maxLength: 150, nullable: false),
                    Location = table.Column<string>(type: "TEXT", nullable: true),
                    Country = table.Column<string>(type: "TEXT", maxLength: 100, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Facilities", x => x.FacilityId);
                });

            migrationBuilder.CreateTable(
                name: "Vehicles",
                columns: table => new
                {
                    VehicleId = table.Column<Guid>(type: "TEXT", nullable: false),
                    VehicleName = table.Column<string>(type: "TEXT", nullable: false),
                    LicensePlate = table.Column<string>(type: "TEXT", maxLength: 20, nullable: false),
                    Type = table.Column<int>(type: "INTEGER", nullable: false),
                    Model = table.Column<string>(type: "TEXT", maxLength: 100, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Vehicles", x => x.VehicleId);
                });

            migrationBuilder.CreateTable(
                name: "EmissionFactors",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "TEXT", nullable: false),
                    Factor = table.Column<double>(type: "REAL", nullable: false),
                    Year = table.Column<int>(type: "INTEGER", nullable: false),
                    Source = table.Column<string>(type: "TEXT", maxLength: 200, nullable: false),
                    EmissionCategoryId = table.Column<Guid>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_EmissionFactors", x => x.Id);
                    table.ForeignKey(
                        name: "FK_EmissionFactors_EmissionCategories_EmissionCategoryId",
                        column: x => x.EmissionCategoryId,
                        principalTable: "EmissionCategories",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "EmissionRecords",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "TEXT", nullable: false),
                    EmissionCategoryId = table.Column<Guid>(type: "TEXT", nullable: false),
                    Quantity = table.Column<double>(type: "REAL", nullable: false),
                    ConsumptionDate = table.Column<DateTime>(type: "TEXT", nullable: false),
                    Description = table.Column<string>(type: "TEXT", maxLength: 500, nullable: false),
                    CalculatedCO2e = table.Column<double>(type: "REAL", nullable: false),
                    FacilityId = table.Column<Guid>(type: "TEXT", nullable: false),
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
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_EmissionRecords_Facilities_FacilityId",
                        column: x => x.FacilityId,
                        principalTable: "Facilities",
                        principalColumn: "FacilityId",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_EmissionRecords_Vehicles_VehicleId",
                        column: x => x.VehicleId,
                        principalTable: "Vehicles",
                        principalColumn: "VehicleId",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.InsertData(
                table: "EmissionCategories",
                columns: new[] { "Id", "CO2Factor", "Name", "Scope", "Unit" },
                values: new object[] { new Guid("4fa85f64-5717-4562-b3fc-2c963f66afa6"), 0.38, "Stromnetz Deutschland", 2, "kWh" });

            migrationBuilder.InsertData(
                table: "Facilities",
                columns: new[] { "FacilityId", "Country", "FacilityName", "Location" },
                values: new object[] { new Guid("85a21e42-7db2-4a1e-84b2-e1c9d2f34e01"), "Deutschland", "Werk München", null });

            migrationBuilder.InsertData(
                table: "EmissionFactors",
                columns: new[] { "Id", "EmissionCategoryId", "Factor", "Source", "Year" },
                values: new object[] { new Guid("11111111-2222-3333-4444-555555555555"), new Guid("4fa85f64-5717-4562-b3fc-2c963f66afa6"), 0.38500000000000001, "Umweltbundesamt", 2026 });

            migrationBuilder.CreateIndex(
                name: "IX_EmissionFactors_EmissionCategoryId",
                table: "EmissionFactors",
                column: "EmissionCategoryId");

            migrationBuilder.CreateIndex(
                name: "IX_EmissionRecords_EmissionCategoryId",
                table: "EmissionRecords",
                column: "EmissionCategoryId");

            migrationBuilder.CreateIndex(
                name: "IX_EmissionRecords_FacilityId",
                table: "EmissionRecords",
                column: "FacilityId");

            migrationBuilder.CreateIndex(
                name: "IX_EmissionRecords_VehicleId",
                table: "EmissionRecords",
                column: "VehicleId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "EmissionFactors");

            migrationBuilder.DropTable(
                name: "EmissionRecords");

            migrationBuilder.DropTable(
                name: "EmissionCategories");

            migrationBuilder.DropTable(
                name: "Facilities");

            migrationBuilder.DropTable(
                name: "Vehicles");
        }
    }
}
