// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using FluentAssertions;
using NUnit.Framework;
using Sitecore.Pages.E2EFramework.UI.Tests.Helpers;
using Sitecore.Pages.E2EFramework.UI.Tests.Helpers.Data;

namespace Sitecore.Pages.E2EFramework.UI.Tests.Features.Templates
{
    public class PageDesigns : BaseFixture
    {
        [Test]

        //BUG https://sitecore.atlassian.net/browse/PGS-1139
        public void SwitchContextBetweenPageDesignEditorAndPages_HomeItemIsResolvedInContext()
        {
            /*Prepare test data items*/
            var testFolder = Preconditions.CreatePageDesignFolder("TestFolderA");
            Preconditions.CreatePageDesign("PageDesign A", testFolder.itemId);
            var testPage = Preconditions.CreatePage();

            //open Pages &  navigate to created page
            Context.Pages.TopBar.AppNavigation.OpenEditor();
            Preconditions.OpenSXAHeadlessSite();
            Preconditions.AddComponent(testPage.itemId, testPage.path, DefaultScData.RenderingId(DefaultScData.SxaRenderings.Title));
            Context.Pages.Editor.LeftHandPanel.SiteContentTree.RefreshTreeAtRootItem();
            Context.Pages.Editor.LeftHandPanel.SelectPage(testPage.name);

            Context.Pages.Editor.CurrentPage.TextInputs.First().Text = "Edit Title comp";

            /*Open Page Designs and invoke builder mode on the new page design*/
            Context.Pages.TopBar.AppNavigation.OpenTemplates();
            Context.Pages.PageTemplates.TemplatesLHSPanel.OpenPageDesigns();
            Context.Pages.PageDesigns.CardContainer.SelectFolder("TestFolderA");
            Context.Pages.PageDesigns.CardContainer.GetBreadCrumbs().Should().Contain("Overview");
            Context.Pages.PageDesigns.PageDesignByName("PageDesign A").Edit();
            Context.Pages.EditPageDesign.Close();

            /*Closing builder mode should retain the inner folder in view*/
            Context.Pages.PageDesigns.CardContainer.GetBreadCrumbs().Should().Contain("Overview");
            Context.Pages.TopBar.AppNavigation.OpenEditor();

            /*Switch back to editor mode Home page should be resolved in context*/
            Context.Pages.Editor.LeftHandPanel.SiteContentTree.IsVisible.Should().BeTrue();
            Context.Pages.Editor.LeftHandPanel.SiteContentTree.SelectedItem.Name.Should().Be("Home");
        }
    }
}
