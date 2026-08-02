using cohabit.application.Domain;
using Microsoft.EntityFrameworkCore;

namespace cohabit.application.Data;

public sealed class CohabitDbContext(DbContextOptions<CohabitDbContext> options) : DbContext(options)
{
    public DbSet<User> Users => Set<User>();
    public DbSet<Listing> Listings => Set<Listing>();
    public DbSet<Address> Addresses => Set<Address>();
    public DbSet<Province> Provinces => Set<Province>();
    public DbSet<ListingType> ListingTypes => Set<ListingType>();
    public DbSet<Image> Images => Set<Image>();
    public DbSet<WatchList> WatchLists => Set<WatchList>();
    public DbSet<Amenity> Amenities => Set<Amenity>();
    public DbSet<ListingAmenity> ListingAmenities => Set<ListingAmenity>();
    public DbSet<Rule> Rules => Set<Rule>();
    public DbSet<ListingRule> ListingRules => Set<ListingRule>();
    public DbSet<VerificationType> VerificationTypes => Set<VerificationType>();
    public DbSet<UserVerification> UserVerifications => Set<UserVerification>();
    public DbSet<Conversation> Conversations => Set<Conversation>();
    public DbSet<Message> Messages => Set<Message>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<User>(entity =>
        {
            entity.ToTable("users", "identity");
            entity.HasKey(u => u.Id);
            entity.Property(u => u.Id).HasColumnName("id");
            entity.Property(u => u.FirstName).HasColumnName("first_name").IsRequired();
            entity.Property(u => u.LastName).HasColumnName("last_name").IsRequired();
            entity.Property(u => u.Cellphone).HasColumnName("cellphone");
            entity.Property(u => u.Email).HasColumnName("email");
            entity.Property(u => u.DateOfBirth).HasColumnName("date_of_birth").IsRequired();
            entity.Property(u => u.Gender).HasColumnName("gender").IsRequired();
            entity.Property(u => u.Bio).HasColumnName("bio");
            entity.Property(u => u.AvatarUrl).HasColumnName("avatar_url");
            entity.Property(u => u.IsOtpVerified).HasColumnName("is_otp_verified");
            entity.Property(u => u.Timestamp).HasColumnName("timestamp");
            entity.Property(u => u.AddressId).HasColumnName("address_id");

            entity.HasOne(u => u.Address)
                .WithMany(a => a.Users)
                .HasForeignKey(u => u.AddressId)
                .IsRequired(false);

            entity.HasMany(u => u.OwnerConversations)
                .WithOne(c => c.Owner)
                .HasForeignKey(c => c.OwnerUserId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasMany(u => u.TenantConversations)
                .WithOne(c => c.Tenant)
                .HasForeignKey(c => c.TenantUserId)
                .OnDelete(DeleteBehavior.Restrict);
        });

        modelBuilder.Entity<Listing>(entity =>
        {
            entity.ToTable("listings", "listings");
            entity.HasKey(l => l.Id);
            entity.Property(l => l.Id).HasColumnName("id");
            entity.Property(l => l.UserId).HasColumnName("user_id").IsRequired();
            entity.Property(l => l.AddressId).HasColumnName("address_id").IsRequired();
            entity.Property(l => l.Title).HasColumnName("title").IsRequired();
            entity.Property(l => l.Description).HasColumnName("description").IsRequired();
            entity.Property(l => l.TypeId).HasColumnName("type_id").IsRequired();
            entity.Property(l => l.Price).HasColumnName("price").IsRequired();
            entity.Property(l => l.Deposit).HasColumnName("deposit").IsRequired();
            entity.Property(l => l.Beds).HasColumnName("beds").IsRequired();
            entity.Property(l => l.Baths).HasColumnName("baths").IsRequired();
            entity.Property(l => l.AvailableFrom).HasColumnName("available_from").IsRequired();
            entity.Property(l => l.ResponseTime).HasColumnName("response_time").IsRequired();
            entity.Property(l => l.Timestamp).HasColumnName("timestamp");
            entity.Property(l => l.Expires).HasColumnName("expires");

            entity.HasOne(l => l.User)
                .WithMany(u => u.Listings)
                .HasForeignKey(l => l.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(l => l.Address)
                .WithMany(a => a.Listings)
                .HasForeignKey(l => l.AddressId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(l => l.Type)
                .WithMany(t => t.Listings)
                .HasForeignKey(l => l.TypeId)
                .OnDelete(DeleteBehavior.Restrict);
        });

        modelBuilder.Entity<Address>(entity =>
        {
            entity.ToTable("addresses", "locations");
            entity.HasKey(a => a.Id);
            entity.Property(a => a.Id).HasColumnName("id");
            entity.Property(a => a.AddressLine1).HasColumnName("address_line1").IsRequired();
            entity.Property(a => a.AddressLine2).HasColumnName("address_line2");
            entity.Property(a => a.Suburb).HasColumnName("suburb").IsRequired();
            entity.Property(a => a.PostalCode).HasColumnName("postal_code").IsRequired();
            entity.Property(a => a.ProvinceId).HasColumnName("province_id").IsRequired();

            entity.HasOne(a => a.Province)
                .WithMany(p => p.Addresses)
                .HasForeignKey(a => a.ProvinceId)
                .OnDelete(DeleteBehavior.Restrict);
        });

        modelBuilder.Entity<Province>(entity =>
        {
            entity.ToTable("provinces", "locations");
            entity.HasKey(p => p.Id);
            entity.Property(p => p.Id).HasColumnName("id");
            entity.Property(p => p.Name).HasColumnName("name").IsRequired();
        });

        modelBuilder.Entity<ListingType>(entity =>
        {
            entity.ToTable("listing_types", "listings");
            entity.HasKey(t => t.Id);
            entity.Property(t => t.Id).HasColumnName("id");
            entity.Property(t => t.Name).HasColumnName("name").IsRequired();
        });

        modelBuilder.Entity<Image>(entity =>
        {
            entity.ToTable("images", "listings");
            entity.HasKey(i => i.Id);
            entity.Property(i => i.Id).HasColumnName("id");
            entity.Property(i => i.ListingId).HasColumnName("listing_id").IsRequired();
            entity.Property(i => i.Url).HasColumnName("url").IsRequired();
            entity.Property(i => i.Sha256).HasColumnName("sha256").HasMaxLength(64);
            entity.Property(i => i.IsPrimary).HasColumnName("is_primary");
            entity.Property(i => i.Timestamp).HasColumnName("timestamp");

            entity.HasOne(i => i.Listing)
                .WithMany(l => l.Images)
                .HasForeignKey(i => i.ListingId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<WatchList>(entity =>
        {
            entity.ToTable("watch_list", "listings");
            entity.HasKey(w => w.Id);
            entity.Property(w => w.Id).HasColumnName("id");
            entity.Property(w => w.UserId).HasColumnName("user_id").IsRequired();
            entity.Property(w => w.ListingId).HasColumnName("listing_id").IsRequired();

            entity.HasOne(w => w.User)
                .WithMany(u => u.WatchLists)
                .HasForeignKey(w => w.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(w => w.Listing)
                .WithMany(l => l.WatchLists)
                .HasForeignKey(w => w.ListingId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<Amenity>(entity =>
        {
            entity.ToTable("amenities", "listings");
            entity.HasKey(a => a.Id);
            entity.Property(a => a.Id).HasColumnName("id");
            entity.Property(a => a.Name).HasColumnName("name").IsRequired();
        });

        modelBuilder.Entity<ListingAmenity>(entity =>
        {
            entity.ToTable("listing_amenities", "listings");
            entity.HasKey(la => la.Id);
            entity.Property(la => la.Id).HasColumnName("id");
            entity.Property(la => la.ListingId).HasColumnName("listing_id").IsRequired();
            entity.Property(la => la.AmenityId).HasColumnName("amenity_id").IsRequired();

            entity.HasOne(la => la.Listing)
                .WithMany(l => l.ListingAmenities)
                .HasForeignKey(la => la.ListingId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(la => la.Amenity)
                .WithMany(a => a.ListingAmenities)
                .HasForeignKey(la => la.AmenityId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<Rule>(entity =>
        {
            entity.ToTable("rules", "listings");
            entity.HasKey(r => r.Id);
            entity.Property(r => r.Id).HasColumnName("id");
            entity.Property(r => r.Name).HasColumnName("name").IsRequired();
        });

        modelBuilder.Entity<ListingRule>(entity =>
        {
            entity.ToTable("listing_rules", "listings");
            entity.HasKey(lr => lr.Id);
            entity.Property(lr => lr.Id).HasColumnName("id");
            entity.Property(lr => lr.ListingId).HasColumnName("listing_id").IsRequired();
            entity.Property(lr => lr.RuleId).HasColumnName("rule_id").IsRequired();

            entity.HasOne(lr => lr.Listing)
                .WithMany(l => l.ListingRules)
                .HasForeignKey(lr => lr.ListingId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(lr => lr.Rule)
                .WithMany(r => r.ListingRules)
                .HasForeignKey(lr => lr.RuleId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<VerificationType>(entity =>
        {
            entity.ToTable("verification_types", "identity");
            entity.HasKey(v => v.Id);
            entity.Property(v => v.Id).HasColumnName("id");
            entity.Property(v => v.Name).HasColumnName("name").IsRequired();
        });

        modelBuilder.Entity<UserVerification>(entity =>
        {
            entity.ToTable("user_verifications", "identity");
            entity.HasKey(uv => uv.Id);
            entity.Property(uv => uv.Id).HasColumnName("id");
            entity.Property(uv => uv.UserId).HasColumnName("user_id").IsRequired();
            entity.Property(uv => uv.VerificationTypeId).HasColumnName("verification_type_id").IsRequired();
            entity.Property(uv => uv.IsVerified).HasColumnName("is_verified");
            entity.Property(uv => uv.Timestamp).HasColumnName("timestamp");

            entity.HasOne(uv => uv.User)
                .WithMany(u => u.UserVerifications)
                .HasForeignKey(uv => uv.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(uv => uv.VerificationType)
                .WithMany(v => v.UserVerifications)
                .HasForeignKey(uv => uv.VerificationTypeId)
                .OnDelete(DeleteBehavior.Restrict);
        });

        modelBuilder.Entity<Conversation>(entity =>
        {
            entity.ToTable("conversations", "messaging");
            entity.HasKey(c => c.Id);
            entity.Property(c => c.Id).HasColumnName("id");
            entity.Property(c => c.ListingId).HasColumnName("listing_id").IsRequired();
            entity.Property(c => c.OwnerUserId).HasColumnName("owner_user_id").IsRequired();
            entity.Property(c => c.TenantUserId).HasColumnName("tenant_user_id").IsRequired();
            entity.Property(c => c.CreatedAt).HasColumnName("created_at").IsRequired();

            entity.HasOne(c => c.Listing)
                .WithMany(l => l.Conversations)
                .HasForeignKey(c => c.ListingId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<Message>(entity =>
        {
            entity.ToTable("messages", "messaging");
            entity.HasKey(m => m.Id);
            entity.Property(m => m.Id).HasColumnName("id");
            entity.Property(m => m.ConversationId).HasColumnName("conversation_id").IsRequired();
            entity.Property(m => m.SenderUserId).HasColumnName("sender_user_id").IsRequired();
            entity.Property(m => m.Content).HasColumnName("content").IsRequired();
            entity.Property(m => m.IsRead).HasColumnName("is_read");
            entity.Property(m => m.Timestamp).HasColumnName("timestamp");

            entity.HasOne(m => m.Conversation)
                .WithMany(c => c.Messages)
                .HasForeignKey(m => m.ConversationId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(m => m.Sender)
                .WithMany(u => u.SentMessages)
                .HasForeignKey(m => m.SenderUserId)
                .OnDelete(DeleteBehavior.Restrict);
        });
    }
}
