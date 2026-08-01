using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace cohabit.application.Migrations
{
    /// <inheritdoc />
    public partial class AddSchemas : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.EnsureSchema(
                name: "locations");

            migrationBuilder.EnsureSchema(
                name: "listings");

            migrationBuilder.EnsureSchema(
                name: "messaging");

            migrationBuilder.EnsureSchema(
                name: "identity");

            migrationBuilder.RenameTable(
                name: "watch_list",
                newName: "watch_list",
                newSchema: "listings");

            migrationBuilder.RenameTable(
                name: "verification_types",
                newName: "verification_types",
                newSchema: "identity");

            migrationBuilder.RenameTable(
                name: "users",
                newName: "users",
                newSchema: "identity");

            migrationBuilder.RenameTable(
                name: "user_verifications",
                newName: "user_verifications",
                newSchema: "identity");

            migrationBuilder.RenameTable(
                name: "rules",
                newName: "rules",
                newSchema: "listings");

            migrationBuilder.RenameTable(
                name: "provinces",
                newName: "provinces",
                newSchema: "locations");

            migrationBuilder.RenameTable(
                name: "messages",
                newName: "messages",
                newSchema: "messaging");

            migrationBuilder.RenameTable(
                name: "listings",
                newName: "listings",
                newSchema: "listings");

            migrationBuilder.RenameTable(
                name: "listing_types",
                newName: "listing_types",
                newSchema: "listings");

            migrationBuilder.RenameTable(
                name: "listing_rules",
                newName: "listing_rules",
                newSchema: "listings");

            migrationBuilder.RenameTable(
                name: "listing_amenities",
                newName: "listing_amenities",
                newSchema: "listings");

            migrationBuilder.RenameTable(
                name: "images",
                newName: "images",
                newSchema: "listings");

            migrationBuilder.RenameTable(
                name: "conversations",
                newName: "conversations",
                newSchema: "messaging");

            migrationBuilder.RenameTable(
                name: "amenities",
                newName: "amenities",
                newSchema: "listings");

            migrationBuilder.RenameTable(
                name: "addresses",
                newName: "addresses",
                newSchema: "locations");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameTable(
                name: "watch_list",
                schema: "listings",
                newName: "watch_list");

            migrationBuilder.RenameTable(
                name: "verification_types",
                schema: "identity",
                newName: "verification_types");

            migrationBuilder.RenameTable(
                name: "users",
                schema: "identity",
                newName: "users");

            migrationBuilder.RenameTable(
                name: "user_verifications",
                schema: "identity",
                newName: "user_verifications");

            migrationBuilder.RenameTable(
                name: "rules",
                schema: "listings",
                newName: "rules");

            migrationBuilder.RenameTable(
                name: "provinces",
                schema: "locations",
                newName: "provinces");

            migrationBuilder.RenameTable(
                name: "messages",
                schema: "messaging",
                newName: "messages");

            migrationBuilder.RenameTable(
                name: "listings",
                schema: "listings",
                newName: "listings");

            migrationBuilder.RenameTable(
                name: "listing_types",
                schema: "listings",
                newName: "listing_types");

            migrationBuilder.RenameTable(
                name: "listing_rules",
                schema: "listings",
                newName: "listing_rules");

            migrationBuilder.RenameTable(
                name: "listing_amenities",
                schema: "listings",
                newName: "listing_amenities");

            migrationBuilder.RenameTable(
                name: "images",
                schema: "listings",
                newName: "images");

            migrationBuilder.RenameTable(
                name: "conversations",
                schema: "messaging",
                newName: "conversations");

            migrationBuilder.RenameTable(
                name: "amenities",
                schema: "listings",
                newName: "amenities");

            migrationBuilder.RenameTable(
                name: "addresses",
                schema: "locations",
                newName: "addresses");
        }
    }
}
