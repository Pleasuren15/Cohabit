using cohabit.application.Domain;
using Microsoft.EntityFrameworkCore;

namespace cohabit.application.Data;

public sealed class CohabitDbContext(DbContextOptions<CohabitDbContext> options) : DbContext(options)
{
    public DbSet<User> Users => Set<User>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<User>(entity =>
        {
            entity.ToTable("users");
            entity.HasKey(u => u.Id);
            entity.Property(u => u.Id).HasColumnName("id");
            entity.Property(u => u.FirstName).HasColumnName("first_name").IsRequired();
            entity.Property(u => u.LastName).HasColumnName("last_name").IsRequired();
            entity.Property(u => u.Cellphone).HasColumnName("cellphone");
            entity.Property(u => u.Email).HasColumnName("email");
            entity.Property(u => u.DateOfBirth).HasColumnName("date_of_birth").IsRequired();
            entity.Property(u => u.Gender).HasColumnName("gender").IsRequired();
            entity.Property(u => u.Bio).HasColumnName("bio");
            entity.Property(u => u.IsOtpVerified).HasColumnName("is_otp_verified");
            entity.Property(u => u.Timestamp).HasColumnName("timestamp");
            entity.Property(u => u.AddressId).HasColumnName("address_id");
        });
    }
}