// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using System;
using System.Collections.Generic;
using Sitecore.Pages.E2EFramework.UI.Tests.ApiHelpers.EdgeGraphQL;
using Sitecore.Pages.E2EFramework.UI.Tests.ApiHelpers.HorizonGraphQL;
using Sitecore.Pages.E2EFramework.UI.Tests.ApiHelpers.PlatformGraphQL;
using Sitecore.Pages.E2EFramework.UI.Tests.ApiHelpers.PlatformGraphQL.Types;

namespace Sitecore.Pages.E2EFramework.UI.Tests.ApiHelpers;

public class ApiHelper
{
    public GraphQLPlatform PlatformGraphQlClient;
    public GraphQlHorizon HorizonGraphQlClient;
    public EdgeGraphQlClient EdgeGraphQLClient;
    public SxaRestClient.SxaRestClient SxaRestClient;
    public TestData TestData;

    public ApiHelper(string baseUrl)
    {
        PlatformGraphQlClient = new GraphQLPlatform(baseUrl);
        HorizonGraphQlClient = new GraphQlHorizon(baseUrl);
        SxaRestClient = new SxaRestClient.SxaRestClient(baseUrl.Replace("/sitecore", ""));
        TestData.Items = new List<Item>();
        TestData.PathsToDelete = new List<string>();
    }

    public void DisposeApiClients()
    {
        HorizonGraphQlClient.Dispose();
        PlatformGraphQlClient.Dispose();
    }

    public void InitializeEdgeClient(string deliveryEdgeUrl, string edgeUrl, string edgeClientId, string edgeClientSecret)
    {
        try
        {
            EdgeGraphQLClient = new EdgeGraphQlClient(deliveryEdgeUrl, edgeUrl, edgeClientId, edgeClientSecret);
        }
        catch (Exception e)
        {
            Console.WriteLine($"Edge client initialization failed with exception: {e.Message}");
        }
    }

    public Item CreatePage(string parentId, string templateId = null)
    {
        var random = new Random();
        var uniqNumber = random.Next(10000, 99999).ToString();
        IItem testPage = PlatformGraphQlClient.CreateItem("Test page " + uniqNumber, parentId, templateId);
        testPage.SetWorkFlow();
        testPage.SetWorkflowState();
        TestData.Items.Add((Item)testPage);

        return (Item)testPage;
    }

    public void CleanTestDataAsync(bool keepProtected = true)
    {
        foreach (var item in TestData.Items)
        {
            if (item.DoNotDelete && keepProtected)
            {
                continue;
            }

            PlatformGraphQlClient.DeleteItemAsync(item.itemId);
        }

        foreach (var path in TestData.PathsToDelete)
        {
            PlatformGraphQlClient.DeleteItemAsync(null, path);
        }
    }

    public void CleanTestData(bool keepProtected = true)
    {
        foreach (var item in TestData.Items)
        {
            if (item.DoNotDelete && keepProtected)
            {
                continue;
            }

            PlatformGraphQlClient.DeleteItem(item.itemId);
        }

        foreach (var path in TestData.PathsToDelete)
        {
            PlatformGraphQlClient.DeleteItem(null, path);
        }
    }
}
