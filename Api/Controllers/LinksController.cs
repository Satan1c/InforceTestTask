using System.Security.Claims;
using System.Text.RegularExpressions;
using Api.Models;
using Db;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Api.Controllers;

[ApiController]
[Route("links")]
[Produces("application/json")]
public class LinksController(LinksDbContext linksDbContext) : Controller
{
	private static readonly Regex s_linkRegex = new(
													@"(http|ftp|https):\/\/([\w_-]+(?:(?:\.[\w_-]+)+))([\w.,@?^=%&:\/~+#-]*[\w@?^=%&\/~+#-])",
													RegexOptions.Compiled | RegexOptions.Singleline
												   );

	private static readonly Regex s_urlRegex = new(
												   @"[^a-zA-Z0-9\:\/?#\[\]@!$&'()\*\+,;=]", RegexOptions.Singleline | RegexOptions.Compiled
												  );

	private readonly LinksDbContext m_linksDbContext = linksDbContext;

	[HttpGet("{shorted}")]
	public async Task<IActionResult> Find(string shorted)
	{
		var redirectUrl = await m_linksDbContext.Links.SingleOrDefaultAsync(l => l.Short == shorted);
		if (redirectUrl is not null) return Ok(redirectUrl.Original);

		return NotFound();
	}

	[Authorize]
	[HttpDelete("delete")]
	public async Task<IActionResult> Delete()
	{
		var deleteForm = await HttpContext.Request.ReadFromJsonAsync<LinkDeleteDto>();
		if (deleteForm is null) return BadRequest("bad form");
		if (deleteForm.Original.Length < 6) return BadRequest("bad original");

		var userId = User.FindFirst(ClaimTypes.Sid)!.Value;
		var link   = await m_linksDbContext.Links.SingleOrDefaultAsync(l => l.UserId == userId && l.Original == deleteForm.Original);

		if (link is null) return Conflict("link doesn't exist");

		m_linksDbContext.Links.Remove(link);
		await m_linksDbContext.SaveChangesAsync();

		return Ok();
	}

	[Authorize]
	[HttpPut("create")]
	public async Task<IActionResult> Create()
	{
		var createForm = await HttpContext.Request.ReadFormAsync();

		if (!createForm.TryGetValue("original", out var originalVal)) return BadRequest("bad original");

		var original = originalVal.ToString().Trim();
		if (original.Length < 6 || !s_linkRegex.IsMatch(original)) return BadRequest("bad shorted");

		var shorted = createForm.TryGetValue("shorted", out var shortedVal) ? shortedVal.ToString().Trim() : string.Empty;
		if (shorted != string.Empty && shorted.Length < 3 && !s_urlRegex.IsMatch(shorted)) return BadRequest("bad shorted");

		var userId = User.FindFirst(ClaimTypes.Sid)!.Value;

		var existedLink = await m_linksDbContext.Links.SingleOrDefaultAsync(
																			l => l.UserId == userId
																				 && (l.Original == original || l.Short == shorted)
																		   );

		if (existedLink is not null)
			return Conflict($"link with same {(existedLink.Original == original ? "original" : "shorted")} is already exist");

		string id;

		do
		{
			id = Guid.NewGuid().ToString();
			if (shorted == string.Empty) shorted = id[..10];
		} while (await m_linksDbContext.Links.SingleOrDefaultAsync(l => l.Id == id || l.Short == shorted) is not null);

		var link = new Link
		{
			CreatedAt = DateTime.UtcNow,
			Id        = id,
			UserId    = userId,
			Original  = original,
			Short     = shorted
		};

		await m_linksDbContext.Links.AddAsync(link);
		await m_linksDbContext.SaveChangesAsync();

		return Json(new LinkInfo
		{
			CreatedAt = link.CreatedAt,
			Original  = original,
			Short     = shorted
		});
	}

	[Authorize]
	[HttpPatch("update")]
	public async Task<IActionResult> Update()
	{
		var updateForm = await HttpContext.Request.ReadFromJsonAsync<LinkUpdateDto>();
		if (updateForm is null) return BadRequest("bad form");
		if (updateForm.Old.Length < 3) return BadRequest("bad old short");
		if (updateForm.New.Length < 3) return BadRequest("bad new short");
		if (updateForm.New == updateForm.Old) return Ok();

		if (!s_urlRegex.IsMatch(updateForm.New)) return BadRequest("bad new");

		var userId      = User.FindFirst(ClaimTypes.Sid)!.Value;
		var existedLink = await m_linksDbContext.Links.SingleOrDefaultAsync(l => l.UserId == userId && l.Short == updateForm.Old);

		if (existedLink is null) return Conflict("link doesn't exist");

		existedLink.Short = updateForm.New;
		await m_linksDbContext.SaveChangesAsync();
		return Ok();
	}
}
