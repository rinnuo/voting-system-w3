using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using bk_sys1_padron_electoral2.Data;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;


var builder = WebApplication.CreateBuilder(args);
builder.Services.AddDbContext<bk_sys1_padron_electoral2Context>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("bk_sys1_padron_electoral2Context") ?? throw new InvalidOperationException("Connection string 'bk_sys1_padron_electoral2Context' not found.")));

// Add services to the container.

builder.Services.AddControllers();
// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();




// 🔑 Tu secret compartida con Django
var jwtSecret = "django-insecure-cwir7qawsz$x5=-n*=2i)xh_28&-hn#x*d(^^dzrddgd&lyuse";

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.RequireHttpsMetadata = false;
    options.SaveToken = true;
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = false,
        ValidateAudience = false,
        ValidateIssuerSigningKey = true,
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSecret))
    };
    
    // 🔍 Agregar eventos para ver qué está pasando
    options.Events = new JwtBearerEvents
    {
        OnAuthenticationFailed = context =>
        {
            Console.WriteLine($"❌ Token inválido: {context.Exception.Message}");
            return Task.CompletedTask;
        },
        OnTokenValidated = context =>
        {
            var claims = context.Principal?.Claims.Select(c => $"{c.Type}: {c.Value}");
            Console.WriteLine("✅ Token válido. Claims:");
            foreach (var claim in claims ?? Enumerable.Empty<string>())
                Console.WriteLine($"   - {claim}");
            return Task.CompletedTask;
        },
        OnChallenge = context =>
        {
            Console.WriteLine("⚠️ Challenge lanzado: token ausente o inválido.");
            return Task.CompletedTask;
        },
        OnForbidden = context =>
        {
            Console.WriteLine("⛔ Acceso denegado: el token es válido pero no tiene permisos.");
            return Task.CompletedTask;
        }
    };
});

builder.Services.AddAuthorization(); //token

builder.Services.AddAuthorization(options =>
{
    options.AddPolicy("EsPadron", policy =>
        policy.RequireClaim("http://schemas.microsoft.com/ws/2008/06/identity/claims/role", "PADRON"));
}); //token

builder.Services.AddHttpClient(); // Para hacer peticiones a system2

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

app.UseStaticFiles(); // para ver imagenes?

app.UseAuthentication(); //token
app.UseAuthorization();

app.MapControllers();

app.Run();
