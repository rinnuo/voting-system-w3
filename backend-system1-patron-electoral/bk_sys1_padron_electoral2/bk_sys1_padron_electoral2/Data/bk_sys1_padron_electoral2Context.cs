using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using bk_sys1_padron_electoral.models;

namespace bk_sys1_padron_electoral2.Data
{
    public class bk_sys1_padron_electoral2Context : DbContext
    {
        public bk_sys1_padron_electoral2Context (DbContextOptions<bk_sys1_padron_electoral2Context> options)
            : base(options)
        {
        }
        
        public DbSet<bk_sys1_padron_electoral.models.Votante> Votante { get; set; } = default!;
    }
}
