// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using FluentAssertions;
using NUnit.Framework;
using Sitecore.Pages.E2EFramework.UI.Tests.ApiHelpers.PlatformGraphQL.Types;
using Sitecore.Pages.E2EFramework.UI.Tests.Helpers;
using Sitecore.Pages.E2EFramework.UI.Tests.Helpers.Data;
using Sitecore.Pages.E2EFramework.UI.Tests.Wrappers.Controls;

namespace Sitecore.Pages.E2EFramework.UI.Tests.Features.General.PageSettings
{
    public class PageDetails : BaseFixture
    {

        [OneTimeSetUp]
        public void Setup()
        {
            Preconditions.OpenSXAHeadlessSite();
        }

        [Test]
        public void SelectingSettingsOnThePage_OpensPageDetails()
        {

            Item testPage = Preconditions.CreatePage();

            //change created page adding new component
            Preconditions.AddComponent(testPage.itemId, testPage.path, DefaultScData.RenderingId(DefaultScData.SxaRenderings.Title));
            Context.Pages.Editor.LeftHandPanel.SiteContentTree.RefreshTreeAtRootItem();
            Context.Pages.Editor.LeftHandPanel.SelectPage(testPage.name);

            //get createdAt and updatedAt values
            var changedItem = Context.ApiHelper.PlatformGraphQlClient.GetItem(testPage.path);
            var createdDate = Wrappers.Helpers.GetAndFormatDateAsString(changedItem.createdAt.value);
            var updatedDate = Wrappers.Helpers.GetAndFormatDateAsString(changedItem.updatedAt.value);

            //open Settings
            PageDetailsDialog pageDetails = Context.Pages.Editor.LeftHandPanel.SiteContentTree.SelectedItem
                .InvokeContextMenu().InvokePageDetailsDialog();


            //open Details section
            var details = pageDetails.GetPageDetailsSection();

            //assert
            details.GetValueByLabel("Created by").Should().Be("sitecore\\admin@pagestest.com");
            details.GetValueByLabel("Last modified by").Should().Be("sitecore\\admin@pagestest.com");
            details.GetValueByLabel("Date created").Should().Be(createdDate);

            details.GetValueByLabel("Date last modified").Should().Be(updatedDate);
        }

        [Test]
        public void OpenPageDetailsNotOnTheSelectedItem_SettingAreOpenedForAppropriateItem()
        {
            const string aboutPageName = "About";

            var aboutPage = Context.Pages.Editor.LeftHandPanel.SiteContentTree.GetItemByPath(aboutPageName);
            aboutPage.Hover();
            PageDetailsDialog pageDetails = aboutPage.InvokeContextMenu().InvokePageDetailsDialog();
            Context.Pages.Editor.WaitForNewPageInCanvasLoaded();

            Context.Pages.Editor.RightHandPanel.HeaderText.Should().Be(aboutPageName);
            pageDetails.GetItemName().Should().Be(aboutPageName);
            pageDetails.GetDisplayName().Should().Be(aboutPageName);

            Context.Pages.Editor.LeftHandPanel.SiteContentTree.SelectedItem.Name.Should().Be(aboutPageName);
        }

        [OneTimeTearDown]
        public void CloseDialog()
        {
            Context.Pages.Editor.PageDetails.Close();
        }
    }
}
