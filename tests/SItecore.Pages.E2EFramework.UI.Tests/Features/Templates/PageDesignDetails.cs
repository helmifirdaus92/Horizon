// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using FluentAssertions;
using NUnit.Framework;
using Sitecore.Pages.E2EFramework.UI.Tests.Helpers;

namespace Sitecore.Pages.E2EFramework.UI.Tests.Features.Templates
{
    public class PageDesignDetails : BaseFixture
    {
        private const string TemplateNameA = "Template A";
        private const string TemplateNameB = "Template B";
        private const string PageDesignName = "Page Design A";
        private const string PageDesignWithoutTemplates = "Page Design without temlates";

        [OneTimeSetUp]
        public void CreateTemplateAndPageDesign()
        {
            // create new templates
            var templateA = Preconditions.CreateTemplate(TemplateNameA, Constants.SxaHeadlessSiteTemplatesParentId, new List<string>()
            {
                Constants.SxaBasePageTemplateId
            }, doNotDelete: true);

            var templateB = Preconditions.CreateTemplate(TemplateNameB, Constants.SxaHeadlessSiteTemplatesParentId, new List<string>()
            {
                Constants.SxaBasePageTemplateId
            }, doNotDelete: true);

            // create new page designs
            var pageDesign = Preconditions.CreatePageDesign(PageDesignName, doNotDelete: true);
            Preconditions.CreatePageDesign(PageDesignWithoutTemplates, doNotDelete: true);

            // configure page designs for templates
            Preconditions.ConfigurePageDesigns(Constants.SXAHeadlessSite, templateA.itemId, pageDesign.itemId);
            Preconditions.ConfigurePageDesigns(Constants.SXAHeadlessSite, templateB.itemId, pageDesign.itemId);

            /*after preconditions templates: Template B, Template A should use Page Design A*/

            // Open page designs
            Context.Pages.TopBar.OpenSitesDropdown().SelectSite(site: Constants.SXAHeadlessSite);
            Context.Pages.TopBar.AppNavigation.OpenTemplates();
            Context.Pages.PageTemplates.TemplatesLHSPanel.OpenPageDesigns();
        }

        [OneTimeTearDown]
        public void CloseEditPageDesign(){
            // Needed to close EditPageDesign dialog after the suite
            if (Context.Browser.PageUrl.Contains("editpagedesign?"))
            {
                Context.Pages.EditPageDesign.Close();
            }
        }

        [Test]
        public void NoTemplatesIsUsingPageDesignWithoutTemplates()
        {
            var cardContainer = Context.Pages.PageDesigns.CardContainer;
            cardContainer.InvokeEditModeForItemCard(PageDesignWithoutTemplates);

            WaitForEditPageDesignLoaded();

            Context.Pages.EditPageDesign.LeftHandPanel.PageDesignsEditorPanel.OpenDetails();
            var editPageDesignDetailsPanel = Context.Pages.EditPageDesign.LeftHandPanel.PageDesignsEditorPanel.EditPageDesignDetailsPanel;
            editPageDesignDetailsPanel.GetNoDataTemplateInformationText().Should().Be(Constants.NoDataTemplateInformation);
        }

        [Test]
        public void TwoTemplatesUsingOnePageDesign()
        {
            var expectedList = new List<string>
            {
                TemplateNameA,
                TemplateNameB
            };

            var cardContainer = Context.Pages.PageDesigns.CardContainer;
            cardContainer.InvokeEditModeForItemCard(PageDesignName);

            WaitForEditPageDesignLoaded();

            Context.Pages.EditPageDesign.LeftHandPanel.PageDesignsEditorPanel.OpenDetails();
            var editPageDesignDetailsPanel = Context.Pages.EditPageDesign.LeftHandPanel.PageDesignsEditorPanel.EditPageDesignDetailsPanel;

            editPageDesignDetailsPanel.GetTemplatesUsingPageDesign().Should().BeEquivalentTo(expectedList);
        }

        [Test]
        public void OneTemplateUsingOnePageDesignAndGoToTemplates()
        {
            var cardContainer = Context.Pages.PageDesigns.CardContainer;
            cardContainer.InvokeEditModeForItemCard("Default");

            WaitForEditPageDesignLoaded();

            Context.Pages.EditPageDesign.LeftHandPanel.PageDesignsEditorPanel.OpenDetails();
            var editPageDesignDetailsPanel = Context.Pages.EditPageDesign.LeftHandPanel.PageDesignsEditorPanel.EditPageDesignDetailsPanel;

            editPageDesignDetailsPanel.GetTemplatesUsingPageDesign().Should()
                .BeEquivalentTo(new List<string>
                {
                    "Page"
                }).And.HaveCount(1);
            editPageDesignDetailsPanel.GoToTemplates();

            Context.Pages.PageTemplates.Templates.Count.Should().BeGreaterThan(0);
        }

        [SetUp]
        public void CloseEditPageDesignDialogAndOpenPageDesigns()
        {
            // Close EditPageDesign dialog
            if (Context.Browser.PageUrl.Contains("editpagedesign?"))
            {
                Context.Pages.EditPageDesign.Close();
            }

            // Open page designs
            if (Context.Browser.PageUrl.Contains("templates/pagetemplates?"))
            {
                Context.Pages.PageTemplates.TemplatesLHSPanel.OpenPageDesigns();
            }
        }

        private void WaitForEditPageDesignLoaded()
        {
            if (!Context.Pages.EditPageDesign.IsOpened())
            {
                Context.Pages.EditPageDesign.WaitForLoad();
            }
        }
    }
}
