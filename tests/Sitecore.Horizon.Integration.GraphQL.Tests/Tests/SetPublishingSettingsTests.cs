// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using System;
using System.Linq;
using FluentAssertions;
using GraphQL.Common.Response;
using Newtonsoft.Json;
using NUnit.Framework;
using Sitecore.Horizon.Integration.GraphQL.Tests.Helpers;
using Sitecore.Pages.E2EFramework.UI.Tests.ApiHelpers.HorizonGraphQL.Responses;
using Sitecore.Pages.E2EFramework.UI.Tests.ApiHelpers.PlatformGraphQL;
using Constants = Sitecore.Horizon.Integration.GraphQL.Tests.Helpers.Constants;
using Item = Sitecore.Pages.E2EFramework.UI.Tests.ApiHelpers.PlatformGraphQL.Types.Item;

namespace Sitecore.Horizon.Integration.GraphQL.Tests.Tests;

public class SetPublishingSettingsTests : BaseFixture
{
    [TestCase("now", "")]
    [TestCase("now", "custom")]
    [TestCase("custom", "")]
    [TestCase("custom", "custom")]
    public void SetPublishingSettings_Available(string start, string end)
    {
        string validFrom = string.Empty;
        string validTo = string.Empty;

        switch (start)
        {
            case "now":
                validFrom = DateTime.UtcNow.ToString("s");
                validTo = end == "" ? "" : DateTime.UtcNow.AddDays(10).ToString("s");
                break;
            case "custom":
                validFrom = DateTime.UtcNow.AddMonths(-2).ToString("s");
                validTo = end == "" ? "" : DateTime.UtcNow.AddDays(10).ToString("s");
                break;
        }

        Item pageItem = Context.ApiHelper.PlatformGraphQlClient.CreateItem(Extensions.GetRandomName(), HomePageItem.itemId, PageTemplateId);
        TestData.Items.Add(pageItem);

        GraphQLResponse response = Context.ApiHelper.HorizonGraphQlClient.SetPublishingSettings(
            pageItem.path,
            validFromDate: validFrom,
            validToDate: validTo,
            site: Constants.SXAHeadlessSite);
        SetPublishingSettingsResponse data = JsonConvert.DeserializeObject<SetPublishingSettingsResponse>(response.Data.setPublishingSettings.ToString());

        data.success.Should().BeTrue();
        var item = data.item;
        item.Should().NotBeNull();
        item.id.Should().Be(new Guid(pageItem.itemId).ToString());
        item.version.Should().Be(1);
        DateTime.Parse(item.publishing.validFromDate).Should().Be(DateTime.Parse(validFrom));
        if (validTo == "")
        {
            item.publishing.validToDate.Should().Be("9999-12-31T23:59:59.9999999Z");
        }
        else
        {
            DateTime.Parse(item.publishing.validToDate).Should().Be(DateTime.Parse(validTo));
        }
    }

    [Test]
    public void SetPublishingSettings_NotAvailable()
    {
        Item pageItem = Context.ApiHelper.PlatformGraphQlClient.CreateItem(Extensions.GetRandomName(), HomePageItem.itemId, PageTemplateId);
        TestData.Items.Add(pageItem);

        string validFrom = DateTime.UtcNow.ToString("s");

        GraphQLResponse response = Context.ApiHelper.HorizonGraphQlClient.SetPublishingSettings(
            pageItem.path,
            validFromDate: validFrom,
            site: Constants.SXAHeadlessSite,
            isAvailableToPublish: false);
        SetPublishingSettingsResponse data = JsonConvert.DeserializeObject<SetPublishingSettingsResponse>(response.Data.setPublishingSettings.ToString());

        data.success.Should().BeTrue();
        var item = data.item;
        item.Should().NotBeNull();
        item.id.Should().Be(new Guid(pageItem.itemId).ToString());
        DateTime.Parse(item.publishing.validFromDate).Should().Be(DateTime.Parse(validFrom));
        item.publishing.validToDate.Should().Be("9999-12-31T23:59:59.9999999Z");
        item.version.Should().Be(1);
    }

    [Test]
    public void SetPublishingSettings_ProvidedVersionShouldBeUpdates()
    {
        Item pageItem = Context.ApiHelper.PlatformGraphQlClient.CreateItem(Extensions.GetRandomName(), HomePageItem.itemId, PageTemplateId);
        TestData.Items.Add(pageItem);
        pageItem.AddVersion();
        pageItem.AddVersion();

        string validFrom = DateTime.UtcNow.ToString("s");

        GraphQLResponse response = Context.ApiHelper.HorizonGraphQlClient.SetPublishingSettings(
            pageItem.path,
            validFromDate: validFrom,
            versionNumber: 3,
            site: Constants.SXAHeadlessSite,
            isAvailableToPublish: false);
        SetPublishingSettingsResponse data = JsonConvert.DeserializeObject<SetPublishingSettingsResponse>(response.Data.setPublishingSettings.ToString());

        data.success.Should().BeTrue();
        var item = data.item;
        item.Should().NotBeNull();
        item.id.Should().Be(new Guid(pageItem.itemId).ToString());
        DateTime.Parse(item.publishing.validFromDate).Should().Be(DateTime.Parse(validFrom));
        item.publishing.validToDate.Should().Be("9999-12-31T23:59:59.9999999Z");
        item.version.Should().Be(3);
    }

    [Test]
    public void SetPublishingSettings_PathNotExist()
    {
        GraphQLResponse response = Context.ApiHelper.HorizonGraphQlClient.SetPublishingSettings(
            "not a valid path",
            site: Constants.SXAHeadlessSite);
        SetPublishingSettingsResponse data = JsonConvert.DeserializeObject<SetPublishingSettingsResponse>(response.Data.setPublishingSettings.ToString());

        data.Should().BeNull();
        response.Errors.First().Message.Should().BeEquivalentTo("ItemNotFound");
    }
}
