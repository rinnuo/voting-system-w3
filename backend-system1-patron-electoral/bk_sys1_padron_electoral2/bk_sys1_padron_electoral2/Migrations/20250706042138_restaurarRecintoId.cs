using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace bk_sys1_padron_electoral2.Migrations
{
    /// <inheritdoc />
    public partial class restaurarRecintoId : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "RecintoId",
                table: "Votante",
                type: "int",
                nullable: false,
                defaultValue: 0);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "RecintoId",
                table: "Votante");
        }
    }
}
