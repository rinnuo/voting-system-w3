using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace bk_sys1_padron_electoral2.Migrations
{
    /// <inheritdoc />
    public partial class AddInitial : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Votante",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    CI = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    NombreCompleto = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Direccion = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    FotoCIanverso = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    FotoCIreverso = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    FotoVotante = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    RecintoId = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Votante", x => x.Id);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Votante_CI",
                table: "Votante",
                column: "CI",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Votante");
        }
    }
}
