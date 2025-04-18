// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using System;
using System.Collections.Generic;
using System.Net;
using System.Net.Http;
using FluentAssertions;
using NUnit.Framework;
using Sitecore.Horizon.ContentHub.Dam.Plugin.Tests.UI.Helpers;

namespace Sitecore.Horizon.ContentHub.Dam.Plugin.Tests.UI.TestFeatures
{
    public class ProxyEndpoints : TestsBase
    {
        private HttpClient _client;

        [Test]
        public void GetLiveEndpoint_ReturnsOK()
        {
            CreateHttpClient();
            var response = HorizonApiGet("/content-hub/dam/live");
            response.Content.ReadAsStringAsync().Result.Should().Be("OK");
            _client.Dispose();
        }

        [Test]
        [Ignore("To fix once we know what is the correct site_id")]
        public void GetCurrentSiteId_ReturnsCorrectSiteId()
        {
            CreateHttpClient();
            var response = HorizonApiGet("content-hub/dam/api/GetCurrentSiteId");
            response.Content.ReadAsStringAsync().Result.Should().Be("{\"site_id\":null}");
            _client.Dispose();
        }

        [Test]
        [Ignore("Unauthorized Access exception in BE. Probably related to 85th update of Chrome. Investigate later")]
        public void GetAuthenticationDetails_AuthenticationDetails()
        {
            CreateHttpClient();
            var response = HorizonApiGet("content-hub/dam/api/GetAuthenticationDetails");
            response.Content.ReadAsStringAsync().Result.Should().Be($"{{\"externalRedirectKey\":\"Sitecore\",\"searchPage\":\"{Settings.Instances.ContentHub}/en-us/sitecore-dam-connect/approved-assets\",\"mInstance\":\"{Settings.Instances.ContentHub}\"}}");
            _client.Dispose();
        }

        private HttpResponseMessage HorizonApiGet(string endpoint)
        {
            var responseMessage = _client.GetAsync($"{Settings.Instances.HorizonClient}/{endpoint}").ConfigureAwait(false).GetAwaiter().GetResult();
            return responseMessage;
        }

        private void CreateHttpClient()
        {
            var cookieContainer = new CookieContainer();
            foreach (KeyValuePair<string, string> cookie in Context.Horizon.Browser.GetAllCookies())
            {
                cookieContainer.Add(new Uri(Settings.Instances.HorizonClient), new Cookie(cookie.Key, cookie.Value));
            }

            var handler = new HttpClientHandler
            {
                CookieContainer = cookieContainer
            };
            _client = new HttpClient(handler);
        }
    }
}
