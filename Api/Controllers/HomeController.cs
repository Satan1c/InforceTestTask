using Microsoft.AspNetCore.Mvc;

namespace Api.Controllers;

[Route("/")]
[ApiController]
public sealed class HomeController : Controller
{
	[Route("/privacy")]
	public IActionResult Privacy() => Ok();
}
