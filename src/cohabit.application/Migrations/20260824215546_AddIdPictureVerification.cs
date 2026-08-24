using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace cohabit.application.Migrations
{
    /// <inheritdoc />
    public partial class AddIdPictureVerification : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_user_verifications_user_id",
                schema: "identity",
                table: "user_verifications");

            migrationBuilder.AddColumn<string>(
                name: "back_image_path",
                schema: "identity",
                table: "user_verifications",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "front_image_path",
                schema: "identity",
                table: "user_verifications",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "rejection_reason",
                schema: "identity",
                table: "user_verifications",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "reviewed_at",
                schema: "identity",
                table: "user_verifications",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "reviewed_by_user_id",
                schema: "identity",
                table: "user_verifications",
                type: "uuid",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "status",
                schema: "identity",
                table: "user_verifications",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            // Backfill pre-workflow rows so they are never treated as pending:
            // verified legacy rows -> Approved, everything else -> Rejected.
            // Legacy rows have no document paths, so the review queue (which
            // filters on front_image_path) never sees them either way.
            migrationBuilder.Sql("""
                UPDATE identity.user_verifications
                SET status = CASE WHEN is_verified THEN 1 ELSE 2 END
                WHERE status = 0;
                """);

            migrationBuilder.CreateIndex(
                name: "ux_user_verifications_open_submission",
                schema: "identity",
                table: "user_verifications",
                columns: new[] { "user_id", "verification_type_id" },
                filter: "\"status\" = 0");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "ux_user_verifications_open_submission",
                schema: "identity",
                table: "user_verifications");

            migrationBuilder.DropColumn(
                name: "back_image_path",
                schema: "identity",
                table: "user_verifications");

            migrationBuilder.DropColumn(
                name: "front_image_path",
                schema: "identity",
                table: "user_verifications");

            migrationBuilder.DropColumn(
                name: "rejection_reason",
                schema: "identity",
                table: "user_verifications");

            migrationBuilder.DropColumn(
                name: "reviewed_at",
                schema: "identity",
                table: "user_verifications");

            migrationBuilder.DropColumn(
                name: "reviewed_by_user_id",
                schema: "identity",
                table: "user_verifications");

            migrationBuilder.DropColumn(
                name: "status",
                schema: "identity",
                table: "user_verifications");

            migrationBuilder.CreateIndex(
                name: "IX_user_verifications_user_id",
                schema: "identity",
                table: "user_verifications",
                column: "user_id");
        }
    }
}
