using Microsoft.EntityFrameworkCore;

namespace Db;

[PrimaryKey("Id")]
public class Link
{
	public string   Id        { get; set; }
	public string   UserId    { get; set; }
	public string   Original  { get; set; }
	public string   Short     { get; set; }
	public DateTime CreatedAt { get; set; }
}
