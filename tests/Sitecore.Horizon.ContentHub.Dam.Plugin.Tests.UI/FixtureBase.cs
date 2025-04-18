// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using System;
using System.Management.Automation;
using System.Net.Http;
using System.Xml.Linq;
using System.Xml.XPath;
using NUnit.Framework;
using Sitecore.Horizon.Integration.Tests.Ui.ApiHelpers;
using Sitecore.Horizon.Integration.Tests.Ui.Wrappers;
using UTF;
using Context = Sitecore.Horizon.ContentHub.Dam.Plugin.Tests.UI.Helpers.Context;

namespace Sitecore.Horizon.ContentHub.Dam.Plugin.Tests.UI
{
    [SetUpFixture]
    public sealed class FixtureBase
    {
        [OneTimeSetUp]
        public static void InitHelpers()
        {
            try
            {
                Logger.WriteLineWithTimestamp("OneTimeSetUp started");
                Logger.WriteLineWithTimestamp("CM instance is: " + Settings.Instances.Cm);
                Logger.WriteLineWithTimestamp("Authoring host instance is: " + Settings.Instances.HorizonClient);

                EnableContentHubPlugin();

                //important to keep this for first time loading after sitecore instance has been deployed
                string apiUrl = Settings.Instances.Cm + "/sitecore/shell/Applications/Content Editor";
                using (var client = new HttpClient())
                {
                    client.Timeout = TimeSpan.FromMinutes(5);
                    client.BaseAddress = new Uri(apiUrl);
                    client.GetAsync(apiUrl).Wait();
                }

                Context.ApiHelper = ApiManager.GetApiHelper("CM", 30000);
                Context.ApiHelper.Items.AddDanishLanguage();
                Context.User = Context.ApiHelper.Security.CreateHorizonUserWithEditRights(Settings.AuthorUser.UserName, Settings.AuthorUser.Password);
                Context.Horizon = UiManager.Init(Settings.BrowserName, Settings.Instances.Cm, Settings.Instances.HorizonClient, Settings.HorizonAppPath,
                    Settings.UseHeadlessMode, Settings.BrowserWidth, Settings.BrowserHeight);
                Context.Horizon.LogInToBackend(Context.User.UserName, Context.User.Password).Editor.Open();
                Context.Editor = Context.Horizon.Editor;
                Context.ContentHub = new Helpers.ContentHub(Context.Horizon.Browser, Settings.Instances.ContentHub);
                Context.ContentHub.Login(Settings.ContentHubUser.UserName, Settings.ContentHubUser.Password);
            }
            catch (Exception e)
            {
                Logger.WriteLineWithTimestamp("Sitecore.Horizon.ContentHub.Dam.Plugin.Tests.UI OneTimeSetup failed. Exception: " + e);
                Context.Horizon.Browser.TakeScreenshot("HorizonContentHubDamOneTimeSetupFailed");
                Context.Horizon.Terminate();
                throw;
            }
        }

        [OneTimeTearDown]
        public void GlobalTearDown()
        {
            Logger.WriteLineWithTimestamp("Global Teardown Sitecore.Horizon.ContentHub.Dam.Plugin.Tests.UI");
            Context.Horizon.Terminate();
        }

        private static void EnableContentHubPlugin()
        {
            try
            {
                Logger.WriteLineWithTimestamp("EnableContentHubPlugin started");
                string horizonHost = new Uri(Settings.Instances.HorizonClient).Host;
                var sitecoreHostConfigPath = $"c:\\inetpub\\wwwroot\\{horizonHost}\\sitecorehost.xml";
                var sitecoreHostConfig = XDocument.Load(sitecoreHostConfigPath);
                var pluginsFiltersElement = sitecoreHostConfig.XPathSelectElement("//Sitecore/Plugins/Filters");
                XElement contentHub = pluginsFiltersElement.XPathSelectElement("ContentHub");
                if (contentHub == null)
                {
                    contentHub = new XElement("ContentHub");
                    pluginsFiltersElement.Add(contentHub);
                }

                contentHub.Value = "+ContentHub";
                sitecoreHostConfig.Save(sitecoreHostConfigPath);

                // restart AH webAppPool
                using (var ps = PowerShell.Create())
                {
                    ps.AddCommand("Restart-WebAppPool");
                    ps.AddParameter("Name", horizonHost);
                    var results = ps.Invoke();
                }
                Logger.WriteLineWithTimestamp("EnableContentHubPlugin ended");
            }
            catch (Exception e)
            {
                Logger.WriteLineWithTimestamp("Sitecore.Horizon.ContentHub.Dam.Plugin.Tests.UI EnableContentHubPlugin failed. Exception: " + e);
                throw;
            }
        }
    }
}
