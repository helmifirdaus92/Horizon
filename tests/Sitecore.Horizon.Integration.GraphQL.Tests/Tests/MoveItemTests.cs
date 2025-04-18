// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using System;
using System.Linq;
using FluentAssertions;
using NUnit.Framework;
using Sitecore.Horizon.Integration.GraphQL.Tests.Helpers;
using Sitecore.Pages.E2EFramework.UI.Tests.ApiHelpers.HorizonGraphQL.Responses;
using Sitecore.Pages.E2EFramework.UI.Tests.ApiHelpers.PlatformGraphQL;
using Sitecore.Pages.E2EFramework.UI.Tests.ApiHelpers.PlatformGraphQL.Types;
using Constants = Sitecore.Horizon.Integration.GraphQL.Tests.Helpers.Constants;
using Extensions = Sitecore.Horizon.Integration.GraphQL.Tests.Helpers.Extensions;

namespace Sitecore.Horizon.Integration.GraphQL.Tests.Tests;

public class MoveItemTests : BaseFixture
{
    [Test]
    [Category("BITest")]
    public void MoveItemInto()
    {
        Item page1 = Context.ApiHelper.PlatformGraphQlClient.CreateItem(Extensions.GetRandomName(), HomePageItem.itemId, PageTemplateId);
        Item page2 = Context.ApiHelper.PlatformGraphQlClient.CreateItem(Extensions.GetRandomName(), HomePageItem.itemId, PageTemplateId);
        TestData.Items.Add(page1);
        TestData.Items.Add(page2);

        MoveItemResponse moveItemResponse = Context.ApiHelper.HorizonGraphQlClient.MoveItem(
            new Guid(page2.itemId).ToString(),
            new Guid(page1.itemId).ToString(),
            "INTO",
            Constants.SXAHeadlessSite);
        moveItemResponse.moveItem.success.Should().BeTrue();

        Item checkItem = Context.ApiHelper.PlatformGraphQlClient.GetItem(page2.path);
        checkItem.Should().BeNull();
        checkItem = Context.ApiHelper.PlatformGraphQlClient.GetItem(page1.path);
        checkItem.Should().NotBeNull();
        checkItem.children.nodes.Count.Should().Be(1);
        checkItem.children.nodes.FirstOrDefault().itemId.Should().Be(page2.itemId);
        checkItem = Context.ApiHelper.PlatformGraphQlClient.GetItem($"{page1.path}/{page2.name}");
        checkItem.Should().NotBeNull();
        checkItem.itemId.Should().BeEquivalentTo(page2.itemId);
    }

    [TestCase("BEFORE")]
    [TestCase("AFTER")]
    [Category("BITest")]
    public void MoveItemBefore(string position)
    {
        string itemToMove = string.Empty;
        string targetItem = string.Empty;

        Item parentPage = Context.ApiHelper.PlatformGraphQlClient.CreateItem(Extensions.GetRandomName(), HomePageItem.itemId, PageTemplateId);
        Item page1 = Context.ApiHelper.PlatformGraphQlClient.CreateItem("page1", parentPage.itemId, PageTemplateId);
        Item page2 = Context.ApiHelper.PlatformGraphQlClient.CreateItem("page2", parentPage.itemId, PageTemplateId);
        TestData.Items.Add(parentPage);
        TestData.Items.Add(page1);
        TestData.Items.Add(page2);
        var nodesBefore = Context.ApiHelper.PlatformGraphQlClient.GetItem(parentPage.path).children.nodes;

        switch (position)
        {
            case "BEFORE":
                itemToMove = new Guid(page2.itemId).ToString();
                targetItem = new Guid(page1.itemId).ToString();
                break;
            case "AFTER":
                itemToMove = new Guid(page1.itemId).ToString();
                targetItem = new Guid(page2.itemId).ToString();
                break;
        }

        MoveItemResponse moveItemResponse = Context.ApiHelper.HorizonGraphQlClient.MoveItem(
            itemToMove,
            targetItem,
            position,
            Constants.SXAHeadlessSite);
        moveItemResponse.moveItem.success.Should().BeTrue();

        var nodesAfter = Context.ApiHelper.PlatformGraphQlClient.GetItem(parentPage.path).children.nodes;
        nodesAfter.Count.Should().Be(2);
        nodesAfter.First().name.Should().BeEquivalentTo(nodesBefore.Last().name);
        nodesAfter.Last().name.Should().BeEquivalentTo(nodesBefore.First().name);
    }
}
