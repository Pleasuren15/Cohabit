using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace cohabit.application.Migrations
{
    /// <inheritdoc />
    public partial class AddMessageImagePaths : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "image_paths",
                schema: "messaging",
                table: "messages",
                type: "text",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "image_paths",
                schema: "messaging",
                table: "messages");
        }
    }
}
