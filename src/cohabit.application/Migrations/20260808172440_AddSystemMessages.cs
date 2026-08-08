using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace cohabit.application.Migrations
{
    /// <inheritdoc />
    public partial class AddSystemMessages : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_conversations_listings_listing_id",
                schema: "messaging",
                table: "conversations");

            migrationBuilder.AddColumn<string>(
                name: "title",
                schema: "messaging",
                table: "messages",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AlterColumn<Guid>(
                name: "listing_id",
                schema: "messaging",
                table: "conversations",
                type: "uuid",
                nullable: true,
                oldClrType: typeof(Guid),
                oldType: "uuid");

            migrationBuilder.AddForeignKey(
                name: "FK_conversations_listings_listing_id",
                schema: "messaging",
                table: "conversations",
                column: "listing_id",
                principalSchema: "listings",
                principalTable: "listings",
                principalColumn: "id",
                onDelete: ReferentialAction.SetNull);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_conversations_listings_listing_id",
                schema: "messaging",
                table: "conversations");

            migrationBuilder.DropColumn(
                name: "title",
                schema: "messaging",
                table: "messages");

            migrationBuilder.AlterColumn<Guid>(
                name: "listing_id",
                schema: "messaging",
                table: "conversations",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"),
                oldClrType: typeof(Guid),
                oldType: "uuid",
                oldNullable: true);

            migrationBuilder.AddForeignKey(
                name: "FK_conversations_listings_listing_id",
                schema: "messaging",
                table: "conversations",
                column: "listing_id",
                principalSchema: "listings",
                principalTable: "listings",
                principalColumn: "id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
