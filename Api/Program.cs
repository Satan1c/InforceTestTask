using Db;
using Microsoft.AspNetCore.Authentication.Cookies;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();

builder.Services.AddAuthentication(CookieAuthenticationDefaults.AuthenticationScheme)
	   .AddCookie(
				  options =>
				  {
					  options.ExpireTimeSpan    = TimeSpan.FromDays(7);
					  options.SlidingExpiration = true;
					  options.LoginPath         = "/profile/login";
					  options.LogoutPath        = "/profile/logout";
					  options.Validate();
				  }
				 );

builder.AddNpgsqlDbContext<UserDbContext>("postgresdb");
builder.AddNpgsqlDbContext<LinksDbContext>("postgresdb");

var app = builder.Build();

if (!app.Environment.IsDevelopment())
{
	app.UseExceptionHandler("/error");
	app.UseHsts();
}

app.UseCookiePolicy(new CookiePolicyOptions { MinimumSameSitePolicy = SameSiteMode.Strict, Secure = CookieSecurePolicy.Always });

app.UseStaticFiles();

app.UseRouting();

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();
app.MapControllerRoute("default", "{controller=home}/{action=index}");

app.Run();
