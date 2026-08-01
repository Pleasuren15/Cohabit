using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace cohabit.application.Migrations
{
    /// <inheritdoc />
    public partial class LookupIntPrimaryKeys : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_addresses_provinces_province_id",
                schema: "locations",
                table: "addresses");

            migrationBuilder.DropForeignKey(
                name: "FK_listings_listing_types_type_id",
                schema: "listings",
                table: "listings");

            migrationBuilder.DropForeignKey(
                name: "FK_listing_amenities_amenities_amenity_id",
                schema: "listings",
                table: "listing_amenities");

            migrationBuilder.DropForeignKey(
                name: "FK_listing_rules_rules_rule_id",
                schema: "listings",
                table: "listing_rules");

            migrationBuilder.DropForeignKey(
                name: "FK_user_verifications_verification_types_verification_type_id",
                schema: "identity",
                table: "user_verifications");

            migrationBuilder.DropPrimaryKey(
                name: "PK_provinces",
                schema: "locations",
                table: "provinces");

            migrationBuilder.DropPrimaryKey(
                name: "PK_listing_types",
                schema: "listings",
                table: "listing_types");

            migrationBuilder.DropPrimaryKey(
                name: "PK_amenities",
                schema: "listings",
                table: "amenities");

            migrationBuilder.DropPrimaryKey(
                name: "PK_rules",
                schema: "listings",
                table: "rules");

            migrationBuilder.DropPrimaryKey(
                name: "PK_verification_types",
                schema: "identity",
                table: "verification_types");

            ConvertIdToIntIdentity(migrationBuilder, "locations", "provinces");
            ConvertIdToIntIdentity(migrationBuilder, "listings", "listing_types");
            ConvertIdToIntIdentity(migrationBuilder, "listings", "amenities");
            ConvertIdToIntIdentity(migrationBuilder, "listings", "rules");
            ConvertIdToIntIdentity(migrationBuilder, "identity", "verification_types");
            ConvertFkColumnsToInt(migrationBuilder);

            migrationBuilder.AddPrimaryKey(
                name: "PK_provinces",
                schema: "locations",
                table: "provinces",
                column: "id");

            migrationBuilder.AddPrimaryKey(
                name: "PK_listing_types",
                schema: "listings",
                table: "listing_types",
                column: "id");

            migrationBuilder.AddPrimaryKey(
                name: "PK_amenities",
                schema: "listings",
                table: "amenities",
                column: "id");

            migrationBuilder.AddPrimaryKey(
                name: "PK_rules",
                schema: "listings",
                table: "rules",
                column: "id");

            migrationBuilder.AddPrimaryKey(
                name: "PK_verification_types",
                schema: "identity",
                table: "verification_types",
                column: "id");

            migrationBuilder.AddForeignKey(
                name: "FK_addresses_provinces_province_id",
                schema: "locations",
                table: "addresses",
                column: "province_id",
                principalSchema: "locations",
                principalTable: "provinces",
                principalColumn: "id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_listings_listing_types_type_id",
                schema: "listings",
                table: "listings",
                column: "type_id",
                principalSchema: "listings",
                principalTable: "listing_types",
                principalColumn: "id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_listing_amenities_amenities_amenity_id",
                schema: "listings",
                table: "listing_amenities",
                column: "amenity_id",
                principalSchema: "listings",
                principalTable: "amenities",
                principalColumn: "id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_listing_rules_rules_rule_id",
                schema: "listings",
                table: "listing_rules",
                column: "rule_id",
                principalSchema: "listings",
                principalTable: "rules",
                principalColumn: "id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_user_verifications_verification_types_verification_type_id",
                schema: "identity",
                table: "user_verifications",
                column: "verification_type_id",
                principalSchema: "identity",
                principalTable: "verification_types",
                principalColumn: "id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_addresses_provinces_province_id",
                schema: "locations",
                table: "addresses");

            migrationBuilder.DropForeignKey(
                name: "FK_listings_listing_types_type_id",
                schema: "listings",
                table: "listings");

            migrationBuilder.DropForeignKey(
                name: "FK_listing_amenities_amenities_amenity_id",
                schema: "listings",
                table: "listing_amenities");

            migrationBuilder.DropForeignKey(
                name: "FK_listing_rules_rules_rule_id",
                schema: "listings",
                table: "listing_rules");

            migrationBuilder.DropForeignKey(
                name: "FK_user_verifications_verification_types_verification_type_id",
                schema: "identity",
                table: "user_verifications");

            migrationBuilder.DropPrimaryKey(
                name: "PK_provinces",
                schema: "locations",
                table: "provinces");

            migrationBuilder.DropPrimaryKey(
                name: "PK_listing_types",
                schema: "listings",
                table: "listing_types");

            migrationBuilder.DropPrimaryKey(
                name: "PK_amenities",
                schema: "listings",
                table: "amenities");

            migrationBuilder.DropPrimaryKey(
                name: "PK_rules",
                schema: "listings",
                table: "rules");

            migrationBuilder.DropPrimaryKey(
                name: "PK_verification_types",
                schema: "identity",
                table: "verification_types");

            ConvertIdToGuid(migrationBuilder, "locations", "provinces");
            ConvertIdToGuid(migrationBuilder, "listings", "listing_types");
            ConvertIdToGuid(migrationBuilder, "listings", "amenities");
            ConvertIdToGuid(migrationBuilder, "listings", "rules");
            ConvertIdToGuid(migrationBuilder, "identity", "verification_types");
            ConvertFkColumnsToGuid(migrationBuilder);

            migrationBuilder.AddPrimaryKey(
                name: "PK_provinces",
                schema: "locations",
                table: "provinces",
                column: "id");

            migrationBuilder.AddPrimaryKey(
                name: "PK_listing_types",
                schema: "listings",
                table: "listing_types",
                column: "id");

            migrationBuilder.AddPrimaryKey(
                name: "PK_amenities",
                schema: "listings",
                table: "amenities",
                column: "id");

            migrationBuilder.AddPrimaryKey(
                name: "PK_rules",
                schema: "listings",
                table: "rules",
                column: "id");

            migrationBuilder.AddPrimaryKey(
                name: "PK_verification_types",
                schema: "identity",
                table: "verification_types",
                column: "id");

            migrationBuilder.AddForeignKey(
                name: "FK_addresses_provinces_province_id",
                schema: "locations",
                table: "addresses",
                column: "province_id",
                principalSchema: "locations",
                principalTable: "provinces",
                principalColumn: "id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_listings_listing_types_type_id",
                schema: "listings",
                table: "listings",
                column: "type_id",
                principalSchema: "listings",
                principalTable: "listing_types",
                principalColumn: "id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_listing_amenities_amenities_amenity_id",
                schema: "listings",
                table: "listing_amenities",
                column: "amenity_id",
                principalSchema: "listings",
                principalTable: "amenities",
                principalColumn: "id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_listing_rules_rules_rule_id",
                schema: "listings",
                table: "listing_rules",
                column: "rule_id",
                principalSchema: "listings",
                principalTable: "rules",
                principalColumn: "id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_user_verifications_verification_types_verification_type_id",
                schema: "identity",
                table: "user_verifications",
                column: "verification_type_id",
                principalSchema: "identity",
                principalTable: "verification_types",
                principalColumn: "id",
                onDelete: ReferentialAction.Restrict);
        }

        private static void ConvertIdToIntIdentity(MigrationBuilder migrationBuilder, string schema, string table)
        {
            migrationBuilder.Sql($$"""
                ALTER TABLE {{schema}}.{{table}} ADD COLUMN new_id integer;
                UPDATE {{schema}}.{{table}} SET new_id = s.rn FROM (SELECT id, row_number() OVER (ORDER BY id) AS rn FROM {{schema}}.{{table}}) s WHERE {{schema}}.{{table}}.id = s.id;
                ALTER TABLE {{schema}}.{{table}} ALTER COLUMN new_id SET NOT NULL;
                ALTER TABLE {{schema}}.{{table}} DROP COLUMN id;
                ALTER TABLE {{schema}}.{{table}} RENAME COLUMN new_id TO id;
                ALTER TABLE {{schema}}.{{table}} ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY;
                SELECT setval(pg_get_serial_sequence('{{schema}}.{{table}}', 'id'), (SELECT MAX(id) FROM {{schema}}.{{table}}));
                """);
        }

        private static void ConvertIdToGuid(MigrationBuilder migrationBuilder, string schema, string table)
        {
            migrationBuilder.Sql($$"""
                ALTER TABLE {{schema}}.{{table}} ADD COLUMN new_id uuid;
                UPDATE {{schema}}.{{table}} SET new_id = gen_random_uuid();
                ALTER TABLE {{schema}}.{{table}} ALTER COLUMN new_id SET NOT NULL;
                ALTER TABLE {{schema}}.{{table}} DROP COLUMN id;
                ALTER TABLE {{schema}}.{{table}} RENAME COLUMN new_id TO id;
                """);
        }

        private static void ConvertFkColumnsToInt(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql("ALTER TABLE locations.addresses DROP COLUMN province_id;");
            migrationBuilder.Sql("ALTER TABLE locations.addresses ADD COLUMN province_id integer NOT NULL;");
            migrationBuilder.Sql("ALTER TABLE listings.listings DROP COLUMN type_id;");
            migrationBuilder.Sql("ALTER TABLE listings.listings ADD COLUMN type_id integer NOT NULL;");
            migrationBuilder.Sql("ALTER TABLE listings.listing_amenities DROP COLUMN amenity_id;");
            migrationBuilder.Sql("ALTER TABLE listings.listing_amenities ADD COLUMN amenity_id integer NOT NULL;");
            migrationBuilder.Sql("ALTER TABLE listings.listing_rules DROP COLUMN rule_id;");
            migrationBuilder.Sql("ALTER TABLE listings.listing_rules ADD COLUMN rule_id integer NOT NULL;");
            migrationBuilder.Sql("ALTER TABLE identity.user_verifications DROP COLUMN verification_type_id;");
            migrationBuilder.Sql("ALTER TABLE identity.user_verifications ADD COLUMN verification_type_id integer NOT NULL;");
        }

        private static void ConvertFkColumnsToGuid(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql("ALTER TABLE locations.addresses DROP COLUMN province_id;");
            migrationBuilder.Sql("ALTER TABLE locations.addresses ADD COLUMN province_id uuid NOT NULL;");
            migrationBuilder.Sql("ALTER TABLE listings.listings DROP COLUMN type_id;");
            migrationBuilder.Sql("ALTER TABLE listings.listings ADD COLUMN type_id uuid NOT NULL;");
            migrationBuilder.Sql("ALTER TABLE listings.listing_amenities DROP COLUMN amenity_id;");
            migrationBuilder.Sql("ALTER TABLE listings.listing_amenities ADD COLUMN amenity_id uuid NOT NULL;");
            migrationBuilder.Sql("ALTER TABLE listings.listing_rules DROP COLUMN rule_id;");
            migrationBuilder.Sql("ALTER TABLE listings.listing_rules ADD COLUMN rule_id uuid NOT NULL;");
            migrationBuilder.Sql("ALTER TABLE identity.user_verifications DROP COLUMN verification_type_id;");
            migrationBuilder.Sql("ALTER TABLE identity.user_verifications ADD COLUMN verification_type_id uuid NOT NULL;");
        }
    }
}
