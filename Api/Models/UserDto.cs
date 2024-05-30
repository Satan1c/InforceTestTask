namespace Api.Models;

public class UserDto
{
	public UserInfo   User  { get; set; }
	public LinkInfo[] Links { get; set; }
}

public class UserInfo
{
	public string Name { get; set; }
}

public class LinkInfo
{
	public string   Short     { get; set; }
	public string   Original  { get; set; }
	public DateTime CreatedAt { get; set; }
}
