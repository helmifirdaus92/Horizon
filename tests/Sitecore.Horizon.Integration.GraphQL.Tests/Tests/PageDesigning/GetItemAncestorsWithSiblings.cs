// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using System;
using System.Collections.Generic;
using System.Linq;
using FluentAssertions;
using GraphQL.Common.Response;
using Newtonsoft.Json;
using NUnit.Framework;
using Sitecore.Horizon.Integration.GraphQL.Tests.Helpers;
using Sitecore.Pages.E2EFramework.UI.Tests.ApiHelpers.HorizonGraphQL.Items;
using Sitecore.Pages.E2EFramework.UI.Tests.ApiHelpers.HorizonGraphQL.Responses;
using Sitecore.Pages.E2EFramework.UI.Tests.ApiHelpers.PlatformGraphQL;
using Constants = Sitecore.Horizon.Integration.GraphQL.Tests.Helpers.Constants;
using Template = Sitecore.Pages.E2EFramework.UI.Tests.ApiHelpers.PlatformGraphQL.Types.Template;

namespace Sitecore.Horizon.Integration.GraphQL.Tests.Tests.PageDesigning;

public class GetItemAncestorsWithSiblings : BaseFixture
{
    [Test]
    [Category("BITest")]
    public void GetItemAncestorsWithSiblings_ExpectedValues()
    {
        // Arrange
        var parentFolder = Context.ApiHelper.PlatformGraphQlClient.CreateItem(Extensions.GetRandomName(), HomePageItem.itemId, Constants.FolderTemplateId);
        TestData.Items.Add(parentFolder);

        // Act
        GraphQLResponse response = Context.ApiHelper.HorizonGraphQlClient.GetRawItem(
            parentFolder.path,
            site: Constants.SXAHeadlessSite,
            roots: new[]
            {
                parentFolder.path
            },
            baseTemplateIds: new[]
            {
                Constants.FolderTemplateId
            });
        GetRawItemResponse itemResponse = JsonConvert.DeserializeObject<GetRawItemResponse>(response.Data.ToString());
        List<Item> rawItems = itemResponse.rawItem.ancestorsWithSiblings;

        // Assert
        rawItems.Count.Should().Be(1);

        Item item = rawItems[0];
        item.id.Should().BeEquivalentTo(new Guid(parentFolder.itemId).ToString());
        item.displayName.Should().BeEquivalentTo(parentFolder.name);
        item.parentId.Should().BeEquivalentTo(new Guid(HomePageItem.itemId).ToString());
        item.template.isTemplateDescendantOfAny.Should().BeTrue();
        item.isFolder.Should().BeTrue();
    }

    [Test]
    [Category("BITest")]
    public void GetItemAncestorsWithSiblings_FolderTemplates()
    {
        // Arrange
        List<string> expectedAncestors = new();
        List<string> expectedBasedOnTemplate = new();

        var parentFolder = Context.ApiHelper.PlatformGraphQlClient.CreateItem(Extensions.GetRandomName(), HomePageItem.itemId, Constants.FolderTemplateId);
        TestData.Items.Add(parentFolder);
        expectedAncestors.Add(parentFolder.name);
        expectedBasedOnTemplate.Add(parentFolder.name);

        var f1 = Context.ApiHelper.PlatformGraphQlClient.CreateItem(Extensions.GetRandomName(), parentFolder.itemId, Constants.FolderTemplateId);
        TestData.Items.Add(f1);
        expectedAncestors.Add(f1.name);
        expectedBasedOnTemplate.Add(f1.name);

        var p1 = Context.ApiHelper.PlatformGraphQlClient.CreateItem(Extensions.GetRandomName(), parentFolder.itemId, PageTemplateId);
        TestData.Items.Add(p1);
        expectedAncestors.Add(p1.name);

        Template basedOnFolderTemplate = Context.ApiHelper.PlatformGraphQlClient.CreateItemTemplate("Inherited Template", PageTemplateId, new List<string>()
        {
            Constants.FolderTemplateId
        }).createItemTemplate.itemTemplate;
        TestData.PathsToDelete.Add($"{Constants.TemplatePagePath}/{basedOnFolderTemplate.name}");
        var f11 = Context.ApiHelper.PlatformGraphQlClient.CreateItem(Extensions.GetRandomName(), p1.itemId, basedOnFolderTemplate.templateId);
        TestData.Items.Add(f11);
        expectedAncestors.Add(f11.name);
        expectedBasedOnTemplate.Add(f11.name);

        // Act
        GraphQLResponse response = Context.ApiHelper.HorizonGraphQlClient.GetRawItem(
            p1.path,
            site: Constants.SXAHeadlessSite,
            roots: new[]
            {
                parentFolder.path
            },
            baseTemplateIds: new[]
            {
                Constants.FolderTemplateId
            });
        GetRawItemResponse itemResponse = JsonConvert.DeserializeObject<GetRawItemResponse>(response.Data.ToString());
        List<Item> rawItems = itemResponse.rawItem.ancestorsWithSiblings;

        // Assert
        rawItems.Count.Should().Be(expectedAncestors.Count);
        foreach (var ancestor in expectedAncestors)
        {
            rawItems.Exists(i => i.displayName == ancestor).Should().BeTrue();
        }

        List<Item> templateDescendantOfAnyItems = rawItems.FindAll(i => i.template.isTemplateDescendantOfAny);
        templateDescendantOfAnyItems.Count.Should().Be(expectedBasedOnTemplate.Count);
        foreach (var basedOnTemplate in expectedBasedOnTemplate)
        {
            templateDescendantOfAnyItems.Exists(i => i.displayName == basedOnTemplate).Should().BeTrue();
        }
    }

    [Test]
    [Category("BITest")]
    public void GetItemAncestorsWithSiblings_MultipleTemplates()
    {
        // Arrange
        List<string> expectedAncestors = new();
        List<string> expectedBasedOnTemplate = new();

        Template template1 = Context.ApiHelper.PlatformGraphQlClient.CreateItemTemplate($"Template {Extensions.GetRandomName()}", PageTemplateId, new List<string>()).createItemTemplate.itemTemplate;
        Template template2 = Context.ApiHelper.PlatformGraphQlClient.CreateItemTemplate($"Template {Extensions.GetRandomName()}", PageTemplateId, new List<string>()).createItemTemplate.itemTemplate;
        Template template21 = Context.ApiHelper.PlatformGraphQlClient.CreateItemTemplate($"Template {Extensions.GetRandomName()}", template2.templateId, new List<string>()).createItemTemplate.itemTemplate;
        TestData.PathsToDelete.Add($"{Constants.TemplatePagePath}/{template1.name}");
        TestData.PathsToDelete.Add($"{Constants.TemplatePagePath}/{template2.name}");
        TestData.PathsToDelete.Add($"{Constants.TemplatePagePath}/{template2.name}/{template21.name}");

        var parentFolder = Context.ApiHelper.PlatformGraphQlClient.CreateItem(Extensions.GetRandomName(), HomePageItem.itemId, template1.templateId);
        TestData.Items.Add(parentFolder);
        expectedAncestors.Add(parentFolder.name);
        expectedBasedOnTemplate.Add(parentFolder.name);

        var i1 = Context.ApiHelper.PlatformGraphQlClient.CreateItem(Extensions.GetRandomName(), parentFolder.itemId, template2.templateId);
        TestData.Items.Add(i1);
        expectedAncestors.Add(i1.name);
        expectedBasedOnTemplate.Add(i1.name);

        var i2 = Context.ApiHelper.PlatformGraphQlClient.CreateItem(Extensions.GetRandomName(), parentFolder.itemId, PageTemplateId);
        TestData.Items.Add(i2);
        expectedAncestors.Add(i2.name);

        var i21 = Context.ApiHelper.PlatformGraphQlClient.CreateItem(Extensions.GetRandomName(), i2.itemId, template21.templateId);
        TestData.Items.Add(i21);
        expectedAncestors.Add(i21.name);
        //expectedBasedOnTemplate.Add(i21.name);

        // Act
        GraphQLResponse response = Context.ApiHelper.HorizonGraphQlClient.GetRawItem(
            i2.path,
            site: Constants.SXAHeadlessSite,
            roots: new[]
            {
                parentFolder.path
            },
            baseTemplateIds: new[]
            {
                template1.templateId,
                template2.templateId
            });
        GetRawItemResponse itemResponse = JsonConvert.DeserializeObject<GetRawItemResponse>(response.Data.ToString());
        List<Item> rawItems = itemResponse.rawItem.ancestorsWithSiblings;

        // Assert
        rawItems.Count.Should().Be(expectedAncestors.Count);
        foreach (var ancestor in expectedAncestors)
        {
            rawItems.Exists(i => i.displayName == ancestor).Should().BeTrue();
        }

        List<Item> templateDescendantOfAnyItems = rawItems.FindAll(i => i.template.isTemplateDescendantOfAny);
        templateDescendantOfAnyItems.Count.Should().Be(expectedBasedOnTemplate.Count);
        foreach (var basedOnTemplate in expectedBasedOnTemplate)
        {
            templateDescendantOfAnyItems.Exists(i => i.displayName == basedOnTemplate).Should().BeTrue();
        }
    }

    [Test]
    [Category("BITest")]
    public void GetItemAncestorsWithSiblings_GetParentAndSiblings()
    {
        // Arrange
        List<string> expectedAncestors = new();

        var parentFolder = Context.ApiHelper.PlatformGraphQlClient.CreateItem(Extensions.GetRandomName(), HomePageItem.itemId, Constants.FolderTemplateId);
        TestData.Items.Add(parentFolder);
        expectedAncestors.Add(parentFolder.name);
        var f1 = Context.ApiHelper.PlatformGraphQlClient.CreateItem(Extensions.GetRandomName(), parentFolder.itemId, Constants.FolderTemplateId);
        TestData.Items.Add(f1);
        expectedAncestors.Add(f1.name);
        var f2 = Context.ApiHelper.PlatformGraphQlClient.CreateItem(Extensions.GetRandomName(), parentFolder.itemId, Constants.FolderTemplateId);
        TestData.Items.Add(f2);
        expectedAncestors.Add(f2.name);
        var f21 = Context.ApiHelper.PlatformGraphQlClient.CreateItem(Extensions.GetRandomName(), f2.itemId, Constants.FolderTemplateId);
        TestData.Items.Add(f21);
        expectedAncestors.Add(f21.name);
        var p1 = Context.ApiHelper.PlatformGraphQlClient.CreateItem(Extensions.GetRandomName(), f2.itemId, PageTemplateId);
        TestData.Items.Add(p1);
        expectedAncestors.Add(p1.name);
        var p11 = Context.ApiHelper.PlatformGraphQlClient.CreateItem(Extensions.GetRandomName(), p1.itemId, PageTemplateId);
        TestData.Items.Add(p11);
        expectedAncestors.Add(p11.name);
        var p111 = Context.ApiHelper.PlatformGraphQlClient.CreateItem(Extensions.GetRandomName(), p11.itemId, PageTemplateId);
        TestData.Items.Add(p111);
        var f3 = Context.ApiHelper.PlatformGraphQlClient.CreateItem(Extensions.GetRandomName(), parentFolder.itemId, Constants.FolderTemplateId);
        TestData.Items.Add(f3);
        expectedAncestors.Add(f3.name);
        var f31 = Context.ApiHelper.PlatformGraphQlClient.CreateItem(Extensions.GetRandomName(), f3.itemId, Constants.FolderTemplateId);
        TestData.Items.Add(f31);

        // Act
        GraphQLResponse response = Context.ApiHelper.HorizonGraphQlClient.GetRawItem(
            p1.path,
            site: Constants.SXAHeadlessSite,
            roots: new[]
            {
                parentFolder.path
            });
        GetRawItemResponse itemResponse = JsonConvert.DeserializeObject<GetRawItemResponse>(response.Data.ToString());
        List<Item> rawItems = itemResponse.rawItem.ancestorsWithSiblings;

        // Assert
        rawItems.Count.Should().Be(expectedAncestors.Count);
        foreach (var ancestor in expectedAncestors)
        {
            rawItems.Exists(i => i.displayName == ancestor).Should().BeTrue();
        }
    }

    [Test]
    [Category("BITest")]
    public void GetItemAncestorsWithSiblings_NoSourceSet()
    {
        // Arrange
        List<string> expectedAncestors = new();
        var parentFolder = Context.ApiHelper.PlatformGraphQlClient.CreateItem(Extensions.GetRandomName(), HomePageItem.itemId, Constants.FolderTemplateId);
        TestData.Items.Add(parentFolder);
        expectedAncestors.Add(parentFolder.name);
        expectedAncestors.Add("Home");
        expectedAncestors.Add("Content");

        // Act
        GraphQLResponse response = Context.ApiHelper.HorizonGraphQlClient.GetRawItem(
            parentFolder.path,
            site: Constants.SXAHeadlessSite);
        GetRawItemResponse itemResponse = JsonConvert.DeserializeObject<GetRawItemResponse>(response.Data.ToString());
        List<Item> rawItems = itemResponse.rawItem.ancestorsWithSiblings;

        // Assert
        foreach (var expectedDisplayName in expectedAncestors)
        {
            rawItems.Should().Contain(c => c.displayName == expectedDisplayName);
        }
    }

    [Test]
    public void GetItemAncestorsWithSiblings_InvalidPath()
    {
        // Arrange & Act
        GraphQLResponse response = Context.ApiHelper.HorizonGraphQlClient.GetRawItem(
            "/sitecore/nonexisting",
            site: Constants.SXAHeadlessSite);

        // Assert
        GetRawItemResponse ancestors = JsonConvert.DeserializeObject<GetRawItemResponse>(response.Data.ToString());
        ancestors.rawItem.Should().BeNull();
        response.Errors.Length.Should().BeGreaterOrEqualTo(1);
        response.Errors.First().Message.Should().Be("ItemNotFound");
    }

    [Test]
    public void GetItemAncestorsWithSiblings_InvalidSource()
    {
        // Arrange & Act
        GraphQLResponse response = Context.ApiHelper.HorizonGraphQlClient.GetRawItem(HomePageItem.path,
            roots: new[]
            {
                "/sitecore/nonexisting"
            },
            site: Constants.SXAHeadlessSite);

        // Assert
        GetRawItemResponse ancestors = JsonConvert.DeserializeObject<GetRawItemResponse>(response.Data.ToString());
        ancestors.rawItem.ancestorsWithSiblings.Should().BeNull();
        response.Errors.Length.Should().BeGreaterOrEqualTo(1);
        response.Errors.First().Message.Should().Be("RootNotFound");
    }

    [Test]
    public void GetItemAncestorsWithSiblings_OutOfReachSource()
    {
        // Arrange & Act
        var sibling = Context.ApiHelper.PlatformGraphQlClient.CreateItem(Extensions.GetRandomName(), HomePageItem.itemId, PageTemplateId);
        TestData.Items.Add(sibling);
        GraphQLResponse response = Context.ApiHelper.HorizonGraphQlClient.GetRawItem(HomePageItem.path,
            roots: new[]
            {
                sibling.path
            },
            site: Constants.SXAHeadlessSite);

        // Assert
        GetRawItemResponse ancestors = JsonConvert.DeserializeObject<GetRawItemResponse>(response.Data.ToString());
        ancestors.rawItem.ancestorsWithSiblings.Should().BeNull();
        response.Errors.Length.Should().BeGreaterOrEqualTo(1);
        response.Errors.First().Message.Should().Be("RootNotReachable");
    }

    [Test]
    [Category("BITest")]
    public void GetItemAncestorsWithSiblings_RetrieveDisplayNameBasedOnLanguage()
    {
        // Arrange
        List<string> expectedAncestors = new();

        var parentItem = Context.ApiHelper.PlatformGraphQlClient.CreateItem(Extensions.GetRandomName(), HomePageItem.itemId, PageTemplateId);
        TestData.Items.Add(parentItem);
        expectedAncestors.Add(parentItem.name);

        var item = Context.ApiHelper.PlatformGraphQlClient.CreateItem(Extensions.GetRandomName(), parentItem.itemId, PageTemplateId);
        TestData.Items.Add(item);
        item.AddVersion("da");
        item.SetFieldValue("__Display name", "Danish Display Name", "da");
        item.SetFieldValue("__Display name", "English Display Name", "en");
        expectedAncestors.Add("Danish Display Name");

        var enFolder = Context.ApiHelper.PlatformGraphQlClient.CreateItem(Extensions.GetRandomName(), parentItem.itemId, Constants.FolderTemplateId);
        TestData.Items.Add(enFolder);
        expectedAncestors.Add(enFolder.name);

        // Act
        GraphQLResponse response = Context.ApiHelper.HorizonGraphQlClient.GetRawItem(item.path,
            roots: new[]
            {
                parentItem.path
            },
            site: Constants.SXAHeadlessSite,
            language: "da");
        GetRawItemResponse itemResponse = JsonConvert.DeserializeObject<GetRawItemResponse>(response.Data.ToString());
        List<Item> rawItems = itemResponse.rawItem.ancestorsWithSiblings;

        // Assert
        rawItems.Count.Should().Be(expectedAncestors.Count);
        foreach (var ancestor in expectedAncestors)
        {
            rawItems.Exists(i => i.displayName == ancestor).Should().BeTrue();
        }
    }
}
