using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace bk_sys1_padron_electoral2.Migrations
{
    /// <inheritdoc />
    public partial class addLatLngVotante : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "RecintoId",
                table: "Votante");

            migrationBuilder.AddColumn<double>(
                name: "Lat",
                table: "Votante",
                type: "float",
                nullable: false,
                defaultValue: 0.0);

            migrationBuilder.AddColumn<double>(
                name: "Lng",
                table: "Votante",
                type: "float",
                nullable: false,
                defaultValue: 0.0);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Lat",
                table: "Votante");

            migrationBuilder.DropColumn(
                name: "Lng",
                table: "Votante");

            migrationBuilder.AddColumn<int>(
                name: "RecintoId",
                table: "Votante",
                type: "int",
                nullable: false,
                defaultValue: 0);
        }
    }
}
