﻿using Microsoft.EntityFrameworkCore;

namespace Db;

[PrimaryKey("Id")]
public class User
{
	public string Id       { get; set; }
	public string Name     { get; set; }
	public string Password { get; set; }
}