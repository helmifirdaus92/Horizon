// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using System;
using System.Diagnostics.CodeAnalysis;
using System.IO;
using System.Runtime.CompilerServices;
using Microsoft.AspNetCore.Builder;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.FileProviders;
using Sitecore.Framework.Runtime.Hosting;
using Sitecore.Framework.Runtime.Plugins;
using Sitecore.Horizon.Core;

namespace Sitecore.Horizon.Canvas.Client
{
    [ExcludeFromCodeCoverage]
    public class ConfigureSitecore
    {
        private readonly ISitecoreHostingEnvironment _env;
        private readonly string _clientContentRoot;

        /// <summary>
        /// Initializes a new instance of the <see cref="ConfigureSitecore"/> class.
        /// </summary>
        /// <param name="env">Provides information about the Sitecore hosting environment an application is running in.</param>
        /// <param name="pluginManager">Provides access to the plugins available in the application.</param>
        [SuppressMessage("Microsoft.Usage", "CA1801: Review unused parameters", Justification = "Some parameters are used conditionally.")]
        public ConfigureSitecore(ISitecoreHostingEnvironment env, ISitecorePluginManager pluginManager)
        {
            _env = env ?? throw new ArgumentNullException(nameof(env));

#if DEBUG
            _clientContentRoot = Path.Combine(GetCurrentProjectSourceCodeDir(), "Client");
#else
            _clientContentRoot = Path.Combine(pluginManager.Resolve(this).Path, "Client");
#endif
        }

        [SuppressMessage("Performance", "CA1822:Mark members as static", Justification = "Is required by convention.")]
        [SuppressMessage("Microsoft.Usage", checkId: "CA1801:Review unused parameters", Justification = "Keep it to show it's availability.")]
        public void ConfigureServices(IServiceCollection services)
        {
        }

        public void Configure(IApplicationBuilder app)
        {
            if (HorizonEnvironment.EnableDevLiveClientCompilation)
            {               
                app.Map("/horizon/canvas", hrz =>
                {
                    hrz.UseSpa(spa =>
                    {
                        spa.Options.StartupTimeout = TimeSpan.FromSeconds(30);
                        spa.Options.SourcePath = _clientContentRoot;

                        spa.UseWebpackDevelopmentServer("watch:dev");
                    });
                });
            }
            else
            {
                app.UseMiddleware<OrchestratorScriptMiddleware>(_clientContentRoot);
                app.UseStaticFiles(new StaticFileOptions
                {
                    RequestPath = "/horizon/canvas",
                    FileProvider = new PhysicalFileProvider(Path.Combine(_clientContentRoot, "dist"))
                });
            }
        }

        private static string GetCurrentProjectSourceCodeDir([CallerFilePath] string currentFilePath = "")
        {
            return Path.GetDirectoryName(currentFilePath)!;
        }
    }
}
