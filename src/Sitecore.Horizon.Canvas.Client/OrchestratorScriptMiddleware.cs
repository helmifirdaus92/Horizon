// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using System;
using System.IO;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Options;
using Sitecore.AuthoringHost.Configuration;

namespace Sitecore.Horizon.Canvas.Client
{
    public class OrchestratorScriptMiddleware
    {
        private readonly RequestDelegate _next;
        private readonly string _scriptPath;
        private string? _orchestratorScript = null;
        private string _orchestratorScriptPath = "/horizon/canvas/horizon.canvas.orchestrator.js";
        private string _environment = "production";

        public OrchestratorScriptMiddleware(RequestDelegate next, IOptions<ExternalServicesConfiguration> externalServicesConfiguration, string clientContentRoot)
        {
            if (externalServicesConfiguration?.Value == null)
            {
                throw new ArgumentNullException(nameof(externalServicesConfiguration));
            }

            _next = next;
            _scriptPath = Path.Combine(clientContentRoot, "dist", "horizon.canvas.orchestrator.js");
            _environment = externalServicesConfiguration.Value.Environment;      
        }

        public async Task InvokeAsync(HttpContext context)
        {
            if (context == null)
            {
                throw new ArgumentNullException(nameof(context));
            }

            if (!context.Request.Path.Equals(_orchestratorScriptPath, StringComparison.OrdinalIgnoreCase))
            {
                await _next(context);
                return;
            }
          
            var script = await GetOrhestratorScript();
            context.Response.ContentType = "application/javascript";
            await context.Response.WriteAsync(script);
            return;
        }

        private async Task<string> GetOrhestratorScript()
        {
            if (_orchestratorScript != null)
            {
                return _orchestratorScript;
            }

            var content = await File.ReadAllTextAsync(_scriptPath);
            if(content == null)
            {
                throw new InvalidOperationException("Can not read the content of the horizon.canvas.orchestrator.js file.");
            }

            _orchestratorScript = PatchOrchestratorScript(content);
            return _orchestratorScript;
        }

        private string PatchOrchestratorScript(string original)
        {
            string allowedDomains = "";
            switch (_environment)
            {
                case "staging":
                case "dev":
                case "qa":
                    allowedDomains = "https://pages-staging.sitecore-staging.cloud|https://pages-dev.sitecore-staging.cloud|https://pages-qa.sitecore-staging.cloud|https://ah.xmcloudcm.localhost|http://localhost:5000";
                    break;
                case "pre-production":
                    allowedDomains = "https://pages-preprod.sitecorecloud.io|https://pages-beta.sitecorecloud.io";
                    break;
                default:
                    allowedDomains = "https://pages.sitecorecloud.io";
                    break;
            }

            var patchedScript = original.Replace("http://localhost:5000", allowedDomains, StringComparison.OrdinalIgnoreCase);
            return patchedScript;
        }
    }
}
