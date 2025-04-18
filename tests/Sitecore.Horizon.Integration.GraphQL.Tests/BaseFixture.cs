// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using NUnit.Framework;
using Sitecore.Horizon.Integration.GraphQL.Tests.Helpers;
using Sitecore.Pages.E2EFramework.UI.Tests.ApiHelpers.PlatformGraphQL;
using Sitecore.Pages.E2EFramework.UI.Tests.ApiHelpers.PlatformGraphQL.Types;
using Constants = Sitecore.Horizon.Integration.GraphQL.Tests.Helpers.Constants;

namespace Sitecore.Horizon.Integration.GraphQL.Tests;

[TestFixture]
public class BaseFixture
{
    public Item HomePageItem;
    public string PageTemplateId;

    [OneTimeSetUp]
    public void GetIds()
    {
        // Get Home page item
        HomePageItem = Context.ApiHelper.PlatformGraphQlClient.GetItem(Constants.HomePagePath);
        PageTemplateId = Context.ApiHelper.PlatformGraphQlClient.GetItem(Constants.TemplatePagePath).itemId;
    }

    [SetUp]
    public void SetUp()
    {
        TestSetup.Logger.Information($"test: {TestContext.CurrentContext.Test.Name} start");
    }

    [TearDown]
    public virtual void DeleteTestData()
    {
        TestSetup.Logger.Information($"test: {TestContext.CurrentContext.Test.Name} end");

        Context.ApiHelper.CleanTestData();
        TestData.Items.Clear();
        TestData.PathsToDelete.Clear();
    }
}
