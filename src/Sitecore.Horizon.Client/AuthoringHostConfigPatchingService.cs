// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using System;
using System.Globalization;
using System.IO;
using HtmlAgilityPack;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;
using Newtonsoft.Json;
using Newtonsoft.Json.Serialization;
using Sitecore.AuthoringHost.Configuration;

namespace Sitecore.Horizon.Client
{
    public class AuthoringHostConfigPatchingService : IAuthoringHostConfigPatchingService
    {
        private readonly ExternalServicesConfiguration _externalServicesConfiguration;
        private readonly IOptions<Auth0Configuration> _auth0Configuration;
        private readonly IOptions<GenAiApiConfiguration> _genAiApiUrlsConfiguration;
        private AuthoringHostConfiguration _authoringHostConfig;

        private const string HorizonHostConfigScriptId = "horizon-host-config";

        public AuthoringHostConfigPatchingService(IOptions<Auth0Configuration> auth0Configuration, IOptions<GenAiApiConfiguration> genAiApiUrlsConfiguration,
            IOptions<ExternalServicesConfiguration> externalServicesConfiguration)
        {
            if (externalServicesConfiguration == null)
            {
                throw new ArgumentNullException(nameof(externalServicesConfiguration));
            }

            _auth0Configuration = auth0Configuration ?? throw new ArgumentNullException(nameof(auth0Configuration));
            _genAiApiUrlsConfiguration = genAiApiUrlsConfiguration ?? throw new ArgumentNullException(nameof(genAiApiUrlsConfiguration));
            _externalServicesConfiguration = externalServicesConfiguration.Value;
            _authoringHostConfig = new AuthoringHostConfiguration
            {
                DashboardBaseUrl = _externalServicesConfiguration.DashboardBaseUrl,
                PortalBaseUrl = _externalServicesConfiguration.PortalBaseUrl,
                FormsApiBaseUrl = _externalServicesConfiguration.FormsApiBaseUrl,
                EdgePlatformBaseUrl = _externalServicesConfiguration.EdgePlatformBaseUrl,
                InventoryApiBaseUrl = _externalServicesConfiguration.InventoryApiBaseUrl,
                XMCloudSystemId = _externalServicesConfiguration.XMCloudSystemId,
                FeatureFlagsBaseUrl = _externalServicesConfiguration.FeatureFlagsBaseUrl,
                XMDeployAppApiBaseUrl = _externalServicesConfiguration.XMDeployAppApiBaseUrl,
                XMDeployAppBaseUrl = _externalServicesConfiguration.XMDeployAppBaseUrl,
                ExplorerAppBaseUrl = _externalServicesConfiguration.ExplorerAppBaseUrl,
                ApmServerBaseUrl = _externalServicesConfiguration.ApmServerBaseUrl,
                XMAppsApiBaseUrl = _externalServicesConfiguration.XMAppsApiBaseUrl,
                BrandManagementBaseUrl = _externalServicesConfiguration.BrandManagementBaseUrl,
                Environment = _externalServicesConfiguration.Environment,
                GainsightProductKey = _externalServicesConfiguration.GainsightProductKey,
                Auth0Settings = _auth0Configuration.Value,
                GenAiApiUrls = genAiApiUrlsConfiguration.Value,
                AnalyticsBaseUrl = _externalServicesConfiguration.AnalyticsBaseUrl,
                AnalyticsRegionsMapper = _externalServicesConfiguration.AnalyticsRegionsMapper,
            };
        }

        public void PatchIndexFileWithConfigs(string path)
        {
            var settings = new JsonSerializerSettings
            {
                StringEscapeHandling = StringEscapeHandling.EscapeHtml,
                Culture = CultureInfo.InvariantCulture,
                Formatting = Formatting.Indented,
                ContractResolver = new CamelCasePropertyNamesContractResolver()
            };
            var configs = JsonConvert.SerializeObject(_authoringHostConfig, settings);

            try
            {
                string fileContent = File.ReadAllText(path);
                var htmlDocument = new HtmlDocument();
                htmlDocument.LoadHtml(fileContent);

                var horizonHostConfigScript = htmlDocument.DocumentNode.SelectSingleNode($"//script[@id='{HorizonHostConfigScriptId}']");

                if (horizonHostConfigScript != null)
                {
                    horizonHostConfigScript.InnerHtml = configs;
                }
                else
                {
                    var script = $"<script id='horizon-host-config' type='application/json'>{configs}</script>";
                    HtmlNode head = htmlDocument.DocumentNode.SelectSingleNode("//head");
                    head.PrependChild(HtmlNode.CreateNode(script));
                }

                fileContent = htmlDocument.DocumentNode.OuterHtml;
                File.WriteAllText(path, fileContent);
            }
            catch (Exception ex)
            {
                // Handle the exception as needed
                Console.WriteLine($"Error patching config: {ex.Message}");
#pragma warning disable CA2201 // Do not raise reserved exception types
                throw new Exception("file operation failed");
#pragma warning restore CA2201 // Do not raise reserved exception types
            }
        }
    }
}
