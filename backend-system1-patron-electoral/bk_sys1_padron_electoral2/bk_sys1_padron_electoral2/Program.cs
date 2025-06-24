using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using bk_sys1_padron_electoral2.Data;
var builder = WebApplication.CreateBuilder(args);
builder.Services.AddDbContext<bk_sys1_padron_electoral2Context>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("bk_sys1_padron_electoral2Context") ?? throw new InvalidOperationException("Connection string 'bk_sys1_padron_electoral2Context' not found.")));

// Add services to the container.

builder.Services.AddControllers();
// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

app.UseStaticFiles(); // para ver imagenes?

app.UseAuthorization();

app.MapControllers();

app.Run();
