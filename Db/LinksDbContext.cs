using Microsoft.EntityFrameworkCore;

namespace Db;

public class LinksDbContext(DbContextOptions<LinksDbContext> options) : DbContext(options)
{
	public DbSet<Link> Links { get; set; }
}
