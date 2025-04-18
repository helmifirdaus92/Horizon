// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using System;
using System.Diagnostics.CodeAnalysis;
using System.IO;
using Microsoft.AspNetCore.Builder;
using Microsoft.Extensions.FileProviders;
using Sitecore.Framework.Runtime.Hosting;

namespace Sitecore.Horizon.Host
{
    [ExcludeFromCodeCoverage]
    public class Startup
    {
        // This method gets called by the runtime. Use this method to configure the HTTP request pipeline.
        [SuppressMessage("Performance", "CA1822:Mark members as static", Justification = "This method is a part of ASP.NET Core contract. It's invoked during the startup by host.")]
        public void Configure(IApplicationBuilder app, ISitecoreHostingEnvironment host)
        {
            if (host == null)
            {
                throw new ArgumentNullException(nameof(host)); 
            }

            app.UseStaticFiles(new StaticFileOptions
            {
                FileProvider = new PhysicalFileProvider(
                    Path.Combine(host.ContentRootPath, "Config"))
            });

            app.UseStaticFiles(new StaticFileOptions
            {
                FileProvider = new PhysicalFileProvider(
                    Path.Combine(host.ContentRootPath, "wwwroot"))
            });
        }
    }
}
