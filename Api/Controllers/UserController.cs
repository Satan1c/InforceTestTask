using System.Security.Claims;
using System.Text.RegularExpressions;
using Api.Models;
using Db;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Api.Controllers;

[ApiController]
[Route("profile")]
[Produces("application/json")]
public sealed class UserController(UserDbContext userDbContext, LinksDbContext linksDbContext) : Controller
{
	private static readonly Regex          s_noAsciiRegex     = new("[^ -~]+", RegexOptions.Compiled | RegexOptions.Singleline);
	private readonly        LinksDbContext m_linksDbContext = linksDbContext;

	private readonly UserDbContext m_userDbContext = userDbContext;

	[Authorize]
	[HttpGet("")]
	public async Task<IActionResult> Info()
	{
		var id   = User.FindFirstValue(ClaimTypes.Sid);
		var user = await m_userDbContext.Users.FirstOrDefaultAsync(user => user.Id == id);
		var info = new UserInfo { Name = user?.Name ?? string.Empty };

		var links = await m_linksDbContext.Links.AsQueryable()
										  .Where(link => link.UserId == id)
										  .Select(
												  link => new LinkInfo
												  {
													  Short = link.Short, Original = link.Original, CreatedAt = link.CreatedAt
												  }
												 )
										  .ToArrayAsync();

		return Json(new UserDto { User = info, Links = links });
	}

	[Authorize]
	[HttpGet("login")]
	public IActionResult Login() => Ok();

	[HttpPost("login")]
	public async Task<IActionResult> LoginPost()
	{
		var data = await HttpContext.Request.ReadFormAsync();

		if (!data.TryGetValue("name",     out var nameVal)) return BadRequest("bad name");
		if (!data.TryGetValue("password", out var passwordVal)) return BadRequest("bad password");

		var name     = nameVal.ToString();
		var password = passwordVal.ToString();

		if (s_noAsciiRegex.IsMatch(name)) return BadRequest("bad name");
		if (s_noAsciiRegex.IsMatch(password)) return BadRequest("bad password");

		var existed = await m_userDbContext.Users.SingleOrDefaultAsync(user => user.Name == name);
		if (existed is not null && password != existed.Password) return BadRequest("bad password");
		var id      = existed?.Id ?? Guid.NewGuid().ToString();

		var claims    = new Claim[] { new(ClaimTypes.Sid, id), new(ClaimTypes.Name, password), new(ClaimTypes.Role, "default") };
		var principal = new ClaimsPrincipal(new ClaimsIdentity(claims, CookieAuthenticationDefaults.AuthenticationScheme));

		await HttpContext.SignInAsync(
									  CookieAuthenticationDefaults.AuthenticationScheme, principal,
									  new AuthenticationProperties { IsPersistent = true }
									 );

		if (existed is not null) return Ok();

		await m_userDbContext.Users.AddAsync(new User { Id = id, Name = name, Password = password });
		await m_userDbContext.SaveChangesAsync();

		return Ok();
	}

	[HttpGet("logout")]
	[HttpPost("logout")]
	public async Task<IActionResult> Logout()
	{
		await HttpContext.SignOutAsync(CookieAuthenticationDefaults.AuthenticationScheme);
		return Ok();
	}
}
