// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using System;
using System.Diagnostics.CodeAnalysis;
using System.IO;
using System.Runtime.CompilerServices;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Sitecore.Framework.Runtime.Configuration;
using Sitecore.Framework.Runtime.Hosting;
using Sitecore.Framework.Runtime.Plugins;
using Sitecore.Horizon.Core;

namespace Sitecore.Horizon.Client
{
    public class ConfigureSitecore
    {
        private const string HorizonHostBaseRelativeUrl = "";
        private const string SxaBaseRelativeUrl = "sxa/client";
        private const string HorizonCanvasPath = "/horizon/canvas";
        private const string HorizonRenderEndpoint = "/horizon/render";

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

        public void ConfigureServices(IServiceCollection services)
        {
            string contentRoot = Path.Combine(_clientContentRoot, "dist");
            services.AddSpaStaticFiles(configuration => { configuration.RootPath = contentRoot; });
            services.AddSingleton<IAuthoringHostConfigPatchingService, AuthoringHostConfigPatchingService>();
        }

        public void Configure(IApplicationBuilder app, ISitecoreConfiguration scConfiguration)
        {
            if (app == null)
            {
                throw new ArgumentNullException(nameof(app));
            }

            if (!HorizonEnvironment.EnableDevLiveClientCompilation)
            {
                var indexFilePath = Path.Combine(_clientContentRoot, "dist/index.html");
                var authoringHostConfigPatchingService = app.ApplicationServices.GetRequiredService<IAuthoringHostConfigPatchingService>();
                authoringHostConfigPatchingService.PatchIndexFileWithConfigs(indexFilePath);
            }

            app.UseWhen(IsHorizonRequest, hrz => ConfigureHorizonMiddleware(hrz, scConfiguration));
        }

        private bool IsHorizonRequest(HttpContext context)
        {
            var isHorizonRequest = !context.Request.Path.ToString().Contains(SxaBaseRelativeUrl, StringComparison.Ordinal)
                && !context.Request.Path.ToString().Contains(HorizonRenderEndpoint, StringComparison.Ordinal)
                && !context.Request.Path.ToString().Contains(HorizonCanvasPath, StringComparison.Ordinal);
            return isHorizonRequest;
        }

        private void ConfigureHorizonMiddleware(IApplicationBuilder hrz, ISitecoreConfiguration scConfiguration)
        {


            if (!HorizonEnvironment.EnableDevLiveClientCompilation)
            {
                hrz.UseSpaStaticFiles(new StaticFileOptions
                {
                    RequestPath = HorizonHostBaseRelativeUrl,
                });
            }

            hrz.UseSpa(spa =>
            {
                spa.Options.StartupTimeout = TimeSpan.FromSeconds(120);
                spa.Options.SourcePath = _clientContentRoot;

                if (HorizonEnvironment.EnableDevLiveClientCompilation)
                {
                    string clientServeScriptName = scConfiguration.GetValue("HorizonClient:ClientServeScriptName", "serve");
                    spa.UseWebpackDevelopmentServer(clientServeScriptName, WebpackDevelopmentServerExtensions.WebpackFramework.Angular);
                }
            });
        }

        private static string GetCurrentProjectSourceCodeDir([CallerFilePath] string currentFilePath = "")
        {
            return Path.GetDirectoryName(currentFilePath)!;
        }
    }
}
