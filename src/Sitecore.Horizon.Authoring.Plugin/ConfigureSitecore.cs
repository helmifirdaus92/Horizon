// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using System;
using System.Collections.Generic;
using System.Diagnostics.CodeAnalysis;
using System.Linq;
using System.Reflection;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.CookiePolicy;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.IdentityModel.Tokens;
using Sitecore.AuthoringHost.Configuration;
using Sitecore.Framework.Runtime.Configuration;
using SameSiteMode = Microsoft.AspNetCore.Http.SameSiteMode;

namespace Sitecore.Horizon.Authoring.Plugin
{
    [ExcludeFromCodeCoverage]
    public class ConfigureSitecore
    {
        private readonly ISitecoreConfiguration _scConfiguration;
        private readonly IWebHostEnvironment _env;

        public ConfigureSitecore(ISitecoreConfiguration scConfiguration, IWebHostEnvironment env)
        {
            _env = env ?? throw new ArgumentNullException(nameof(env));
            _scConfiguration = scConfiguration;
            IEnumerable<string> locations = GetType().Assembly.Location.Split('\\').SkipLast(1);

            env.ContentRootPath = string.Join('\\', locations);
        }

        [SuppressMessage("Performance", "CA1822:Mark members as static", Justification = "This method is a part of ASP.NET Core contract. It's invoked during the startup by host.")]
        public void ConfigureServices(IServiceCollection services)
        {
            services.AddMvc().AddApplicationPart(Assembly.GetExecutingAssembly());
            services.AddHttpContextAccessor();

            ConfigureAuthentication(services);
            ConfigureAuth0ConfigurationOptions(services);

            ConfigureGenAiApiConfiguration(services);
            ConfigureGenAiApiConfigurationOptions(services);

            ConfigureExternalConfigurationOptions(services);

        }

        // This method gets called by the runtime. Use this method to configure the HTTP request pipeline.
        [SuppressMessage("Performance", "CA1822:Mark members as static", Justification = "This method is a part of ASP.NET Core contract. It's invoked during the startup by host.")]
        public void Configure(IApplicationBuilder app, IWebHostEnvironment env)
        {

            if (env.IsDevelopment())
            {
                app.UseDeveloperExceptionPage();
            }

            app.UseRouting();

            app.UseAuthentication();
            app.UseAuthorization();

            app.UseCookiePolicy(
                new CookiePolicyOptions
                {
                    Secure = CookieSecurePolicy.Always,
                    HttpOnly = HttpOnlyPolicy.Always,
                    MinimumSameSitePolicy = SameSiteMode.None
                });

            app.UseEndpoints(endpoints =>
            {
                endpoints.MapControllers();
            });
        }

        private void ConfigureExternalConfigurationOptions(IServiceCollection services)
        {
            string dashboardBaseUrl = _scConfiguration.GetValue<string>("Dashboard:BaseUrl");

            services.Configure<ExternalServicesConfiguration>(config =>
            {
                config.InventoryApiBaseUrl = new Uri(_scConfiguration.GetValue<string>("Inventory:APIBaseUrl"), UriKind.RelativeOrAbsolute);
                config.DashboardBaseUrl = string.IsNullOrEmpty(dashboardBaseUrl) ? null : new Uri(dashboardBaseUrl, UriKind.RelativeOrAbsolute);
                config.PortalBaseUrl = new Uri(_scConfiguration.GetValue<string>("Portal:BaseUrl"), UriKind.RelativeOrAbsolute);
                config.FormsApiBaseUrl = _scConfiguration.GetValue<string>("Forms:ApiBaseUrl");
                config.EdgePlatformBaseUrl = new Uri(_scConfiguration.GetValue<string>("EdgePlatform:BaseUrl"), UriKind.RelativeOrAbsolute);
                config.XMCloudSystemId = _scConfiguration.GetValue<string>("XMCloud:SystemId");
                config.FeatureFlagsBaseUrl = new Uri(_scConfiguration.GetValue<string>("FeatureFlags:BaseUrl"), UriKind.RelativeOrAbsolute);
                config.XMDeployAppApiBaseUrl = new Uri(_scConfiguration.GetValue<string>("XMDeployApp:APIBaseUrl"), UriKind.RelativeOrAbsolute);
                config.XMDeployAppBaseUrl = new Uri(_scConfiguration.GetValue<string>("XMDeployApp:AppBaseUrl"), UriKind.RelativeOrAbsolute);
                config.ExplorerAppBaseUrl = new Uri(_scConfiguration.GetValue<string>("ExplorerApp:BaseUrl"), UriKind.RelativeOrAbsolute);
                config.ApmServerBaseUrl = new Uri(_scConfiguration.GetValue<string>("ApmServer:BaseUrl"), UriKind.RelativeOrAbsolute);
                config.XMAppsApiBaseUrl = new Uri(_scConfiguration.GetValue<string>("XMAppsApi:BaseUrl"), UriKind.RelativeOrAbsolute);
                config.BrandManagementBaseUrl = _scConfiguration.GetValue<string>("BrandManagement:BaseUrl");
                config.Environment = _scConfiguration.GetValue<string>("AppEnvironment");
                config.GainsightProductKey = _scConfiguration.GetValue<string>("GainsightProductKey");
                config.AnalyticsBaseUrl = _scConfiguration.GetValue<string>("Analytics:BaseUrl");
                config.AnalyticsRegionsMapper = _scConfiguration.GetValue<string>("Analytics:RegionsMapper");
            });
        }

        private void ConfigureAuth0ConfigurationOptions(IServiceCollection services)
        {
            services.AddOptions<Auth0Configuration>().Bind(_scConfiguration.GetSection(Auth0Configuration.Key));
        }

        private void ConfigureAuthentication(IServiceCollection services)
        {
            Auth0Configuration auth0Configuration = _scConfiguration.GetSection(Auth0Configuration.Key).Get<Auth0Configuration>();

            services.AddAuthentication(options => { options.DefaultScheme = JwtBearerDefaults.AuthenticationScheme; })
                .AddJwtBearer(options =>
                {
                    options.Authority = auth0Configuration.Domain;
                    options.TokenValidationParameters = new TokenValidationParameters
                    {
                        ValidateAudience = true,
                        ValidAudiences = new[]
                        {
                            auth0Configuration.Audience,
                            auth0Configuration.InternalAudience,
                            auth0Configuration.WebAppAudience,
                            auth0Configuration.PagesAudience
                        }
                    };
                });
        }

        private void ConfigureGenAiApiConfigurationOptions(IServiceCollection services)
        {
            services.AddOptions<GenAiApiConfiguration>().Bind(_scConfiguration.GetSection(GenAiApiConfiguration.Key));
        }

        private void ConfigureGenAiApiConfiguration(IServiceCollection services)
        {
            GenAiApiConfiguration genAiApiConfiguration = _scConfiguration.GetSection(GenAiApiConfiguration.Key).Get<GenAiApiConfiguration>();

            services.Configure<GenAiApiConfiguration>(config =>
            {
                config.BaseUrl = genAiApiConfiguration.BaseUrl;
            });
        }
    }
}
