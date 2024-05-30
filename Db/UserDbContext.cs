using Microsoft.EntityFrameworkCore;

namespace Db;

public class UserDbContext(DbContextOptions<UserDbContext> options) : DbContext(options)
{
	public DbSet<User> Users { get; set; }
}
