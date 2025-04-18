// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using System.Text.RegularExpressions;
using FluentAssertions;
using NUnit.Framework;
using Sitecore.E2E.Test.Framework;
using Sitecore.Pages.E2EFramework.UI.Tests.ApiHelpers.PlatformGraphQL;
using Sitecore.Pages.E2EFramework.UI.Tests.ApiHelpers.PlatformGraphQL.Types;
using Sitecore.Pages.E2EFramework.UI.Tests.Helpers;
using Sitecore.Pages.E2EFramework.UI.Tests.Wrappers;
using Sitecore.Pages.E2EFramework.UI.Tests.Wrappers.Components.Templates;
using Sitecore.Pages.E2EFramework.UI.Tests.Wrappers.Controls;
using Sitecore.Pages.E2EFramework.UI.Tests.Wrappers.Controls.Dialog;
using Sitecore.Pages.E2EFramework.UI.Tests.Wrappers.Data;
using Constants = Sitecore.Pages.E2EFramework.UI.Tests.Helpers.Constants;

namespace Sitecore.Pages.E2EFramework.UI.Tests.Features.Templates
{
    public class PageTemplatesOverview : BaseFixture
    {
        private const string NewPageTemplateName = "New test template 56411";

        private const string TemplateA = "Template A";

        private const string RenamedTemplate = "RenamedTemplate";
        private static string TemplateAId;
        private static List<TenantTemplate> _tenantTemplatesList = new List<TenantTemplate>();

        private static List<string> _baseTemplatesList = new List<string>()
        {
            "371D5FBB-5498-4D94-AB2B-E3B70EEBE78C",
            "4414A1F9-826A-4647-8DF4-ED6A95E64C43",
            "6650FB34-7EA1-4245-A919-5CC0F002A6D7",
            "F39A594A-7BC9-4DB0-BAA1-88543409C1F9"
        };

        private DuplicateDialog duplicateDialog;
        private TemplateInfo itemCard;

        [Test]
        public void SelectsDuplicateOptionOnPageTemplate_DuplicatesPageTemplate()
        {
            // Invoke Duplicate Dialog
            itemCard = Context.Pages.PageTemplates.Templates.Find(t => t.Name.Equals("Page"));
            duplicateDialog = itemCard.InvokeDuplicateDialog();

            // Input validations
            duplicateDialog.EnterItemName(string.Empty);
            duplicateDialog.ValidationErrorMsg.Should().Be(Constants.NameCannotBeEmptyErrMsg);
            duplicateDialog.EnterItemName(" ");
            duplicateDialog.ValidationErrorMsg.Should().Be(Constants.InvalidCharactersErrMsg);
            duplicateDialog.EnterItemName("%wrong name &");
            duplicateDialog.ValidationErrorMsg.Should().Be(Constants.InvalidCharactersErrMsg);
            duplicateDialog.EnterItemName("Page");
            duplicateDialog.ValidationErrorMsg.Should().Be(Constants.NameIsAlreadyInUseErrMsg);
            string str = DataHelper.GenerateLongString(101);
            duplicateDialog.EnterItemName(str);
            duplicateDialog.ClickDuplicateButton();
            duplicateDialog.ValidationErrorMsg.Should().Be(Constants.NameLengthErrMsg);

            // Cancel operation validation
            duplicateDialog.ClickCancelButton();
            Context.Pages.PageTemplates.Templates.Should().NotContain(NewPageTemplateName);

            // Duplicate template
            itemCard = Context.Pages.PageTemplates.Templates.Find(t => t.Name.Equals("Page"));
            duplicateDialog = itemCard.InvokeDuplicateDialog();
            duplicateDialog.EnterItemName(NewPageTemplateName);
            duplicateDialog.ClickDuplicateButton();

            // Check that Template was duplicated
            Context.Pages.PageTemplates.Templates.Should().Contain(template => template.Name.Equals(NewPageTemplateName));
        }

        [Test]
        public void OverviewOfPageTemplates()
        {
            var tenantTemplates = Context.ApiHelper.PlatformGraphQlClient
                .GetTenantTemplates(Constants.SXAHeadlessSite);

            // Assert that one template card for each template card available
            Context.Pages.PageTemplates.Templates.Count.Should().Be(tenantTemplates.Count);

            // Assert that user see template name, associated page design
            for (int i = 0; i < tenantTemplates.Count; i++)
            {
                Context.Pages.PageTemplates.Templates[i].Name.Should().Be(tenantTemplates[i].template.name);
                Context.Pages.PageTemplates.Templates[i].AssociatedPageDesign.Should()
                    .Contain(tenantTemplates[i].pageDesign != null ? tenantTemplates[i].pageDesign.name : "NONE SET");
            }

            // Assert page count value on test template
            var templateInfo = Context.Pages.PageTemplates.TemplateInfoByName(TemplateA);
            templateInfo.UsageCount.Should().Be(1);
        }

        [Test]
        public void UserClickOnCreateTemplateButton_ContentEditorOpened()
        {
            // Click "Create template" button
            Context.Pages.PageTemplates.CardContainer.ClickCreateButton();

            // Assert that Content Editor is opened in a new window
            Context.Browser.SwitchToTab("/sitecore/shell/Applications");

            Context.Browser.GetDriver().Url.Should().Match(@"*/sitecore/shell/Applications/Content%20Editor.aspx?fo=3C1715FE-6A13-4FCF-845F-DE308BA9741D&lang=en*");
        }

        [Test, Category("De-scopedWithXMAppsApi")]
        public void UserOpensTemplates_ForNonSXASIte_WarningMessageIsShown()
        {
            Context.Pages.TopBar.OpenSitesDropdown().SelectSite(site: Constants.NonSXASite);

            // Check that warning dialog appears and have all information 
            var dialog = new FeatureNotAvailableDialog(Context.Browser.FindElement("ng-spd-dialog-panel"));

            dialog.CheckTextInFirstParagraph().Should().BeTrue();
            dialog.CheckTextInSecondParagraph().Should().BeTrue();

            dialog.ClickDismissButton();
            Context.Pages.Editor.WaitForNewPageInCanvasLoaded();

            Context.Pages.TopBar.AppNavigation.EditorTabIsActive.Should().BeTrue();
        }

        [Test]
        public void UserEditsPageTemplate_FromTheContextMenuManageFieldsOption_ContentEditorOpened()
        {
            var siteTemplates = Context.ApiHelper.PlatformGraphQlClient.GetTenantTemplates(Constants.SXAHeadlessSite);
            var tenantTemplateId = siteTemplates.Find(i => i.template.name.Equals(TemplateA)).template.templateId;

            // Invoke context menu on template and click "ManageFields" option in context menu
            Context.Pages.PageTemplates.TemplateInfoByName(TemplateA).InvokeContextMenu().SelectOption(ContextMenu.ContextMenuButtons.ManageFields);

            // Assert that Content Editor is opened in a new window
            Context.Browser.SwitchToTab("/sitecore/shell/Applications");

            // Extract the ID from the URL and normalize its format
            string urlId = Regex.Match(Context.Browser.GetDriver().Url, @"fo=([a-f0-9\-]+)&").Groups[1].Value;
            string normalizedTemplateIdFromUrl = urlId.Replace("-", "").ToLowerInvariant();

            // Check that opened URL from CE and has the appropriate template ID
            Context.Browser.GetDriver().Url.Should().Match($@"*/sitecore/shell/Applications/Content%20Editor.aspx*");
            normalizedTemplateIdFromUrl.Should().Be(tenantTemplateId);
        }

        [Test]
        public void UserRenames_PageTemplateFromContextMenu()
        {
            // Invoke Rename dialog
            var renameDialog = Context.Pages.PageTemplates.TemplateInfoByName(TemplateA).InvokeRenameDialog();
            renameDialog.IsDisplayed.Should().BeTrue();
            renameDialog.SaveEnabled.Should().BeFalse();

            // Push Cancel button
            renameDialog.ClickCancelButton();

            // Check that Template A remains unchanged
            Context.ApiHelper.PlatformGraphQlClient.GetTenantTemplates(Constants.SXAHeadlessSite)
                .FindAll(t => t.template.name.Equals(TemplateA)).Should().HaveCount(1);
            Context.Pages.PageTemplates.Templates.FindAll(t => t.Name.Equals(TemplateA)).Should().HaveCount(1);

            // Invoke Rename dialog and rename "Template A" to "RenamedTemplate"
            renameDialog = Context.Pages.PageTemplates.TemplateInfoByName(TemplateA).InvokeRenameDialog();
            renameDialog.EnterItemName(RenamedTemplate);
            renameDialog.SaveEnabled.Should().BeTrue();
            renameDialog.ClickSaveButton();

            // Check that "RenamedTemplate" available in Page Templates overview
            Context.ApiHelper.PlatformGraphQlClient.GetTenantTemplates(Constants.SXAHeadlessSite)
                .FindAll(t => t.template.name.Equals(RenamedTemplate)).Should().HaveCount(1);
            Context.Pages.PageTemplates.Templates.FindAll(t => t.Name.Equals(RenamedTemplate)).Should().HaveCount(1);
        }


        [Test]
        public void RenamePageTemplateDialog_InputValidation()
        {
            // Invoke Rename dialog
            var renameDialog = Context.Pages.PageTemplates.TemplateInfoByName(TemplateA).InvokeRenameDialog();
            renameDialog.IsDisplayed.Should().BeTrue();
            renameDialog.SaveEnabled.Should().BeFalse();

            // Input validation
            renameDialog.EnterItemName("");
            renameDialog.ValidationErrorMsg.Should().Be(Constants.NameCannotBeEmptyErrMsg);
            renameDialog.EnterItemName("__*^^&");
            renameDialog.ValidationErrorMsg.Should().Be(Constants.InvalidCharactersErrMsg);
            renameDialog.EnterItemName(TemplateA);
            renameDialog.ValidationErrorMsg.Should().Be(Constants.NameIsAlreadyInUseErrMsg);
            renameDialog.EnterItemName(Wrappers.Helpers.GenerateLongString(101));
            renameDialog.ClickSaveButtonWithoutWaiting();
            renameDialog.ValidationErrorMsg.Should().Be(Constants.NameLengthErrMsg);
            renameDialog.Close();
        }

        [Test]
        public void UserDeletes_PageTemplate()
        {
            // Invoke Delete dialog
            var deleteDialog = Context.Pages.PageTemplates.TemplateInfoByName(TemplateA).InvokeDeleteDialog();

            // Push Cancel button
            deleteDialog.ClickCancelButton();

            // Check that Template A was not deleted
            Context.ApiHelper.PlatformGraphQlClient.GetTenantTemplates(Constants.SXAHeadlessSite)
                .FindAll(t => t.template.name.Equals(TemplateA)).Should().HaveCount(1);
            Context.Pages.PageTemplates.Templates.FindAll(t => t.Name.Equals(TemplateA)).Should().HaveCount(1);

            // Invoke Delete dialog and push "Delete" button
            deleteDialog = Context.Pages.PageTemplates.TemplateInfoByName(TemplateA).InvokeDeleteDialog();
            deleteDialog.ClickDeleteButton();

            Context.Browser.GetDriver().WaitForNetworkCalls();

            //Error message appears as template is used by a page item
            Context.Pages.PageTemplates.TimedNotification.Message.Should().Be($"The '{Guid.Parse(TemplateAId)}' template is used by at least one item. Delete all the items that are based on this template first.");

            //Create a duplicate and try delete on the copied template
            Context.Pages.PageTemplates.TemplateInfoByName(TemplateA)
                .InvokeDuplicateDialog()
                .ClickDuplicateButton();

            // Invoke Delete dialog and "Delete" template
            deleteDialog = Context.Pages.PageTemplates.TemplateInfoByName($"Copy of {TemplateA}").InvokeDeleteDialog();
            deleteDialog.ClickDeleteButton();

            // Check that Template A was deleted
            Context.ApiHelper.PlatformGraphQlClient.GetTenantTemplates(Constants.SXAHeadlessSite)
                .FindAll(t => t.template.name.Equals($"Copy of {TemplateA}")).Should().BeEmpty();
            Context.Pages.PageTemplates.Templates.FindAll(t => t.Name.Equals($"Copy of {TemplateA}")).Should().BeEmpty();
        }

        [Test]
        public void NoPageTemplatesAvailable()
        {
            // a site with no page templates is available
            Context.ApiHelper.HorizonGraphQlClient
                .WaitForCondition(o => o.GetSites().Any(s => s.name.Equals(Constants.EmptySite)), TimeSpan.FromSeconds(180), 1000, message: "EmptySite is not available in CM");

            _tenantTemplatesList = Context.ApiHelper.PlatformGraphQlClient.GetTenantTemplates(Constants.EmptySite);
            foreach (var tenantTemplate in _tenantTemplatesList)
            {
                Context.ApiHelper.PlatformGraphQlClient.UpdateItemTemplate(tenantTemplate.template.templateId, _baseTemplatesList);
            }

            // user opens page templates in site with no templates
            Context.Pages.TopBar.OpenSitesDropdown().SelectSite(site: Constants.EmptySite);

            // check that overview is empty
            Context.Pages.PageTemplates.CardContainer.GetEmptyViewText().Should().Be("You don’t have any page templates");

            // switch back to sxa test site after validation
            Context.Pages.TopBar.OpenSitesDropdown().SelectSite(site: Constants.SXAHeadlessSite);
        }

        [OneTimeSetUp]
        public void CreateDataTemplate()
        {
            var response = Context.ApiHelper.PlatformGraphQlClient.CreateItemTemplate(TemplateA, Constants.SxaHeadlessSiteTemplatesParentId, new List<string>()
            {
                Constants.SxaBasePageTemplateId
            });
            TemplateAId = response.createItemTemplate.itemTemplate.templateId;
            Item dataTemplate = Context.ApiHelper.PlatformGraphQlClient.GetItem(TemplateAId);
            dataTemplate.DoNotDelete = true;
            Preconditions.CreatePage(displayName: "TestPage", templateId: TemplateAId, doNotDelete: true);
            TestData.Items.Add(dataTemplate);
        }

        [SetUp]
        public void CreateTestData()
        {
            // Open templates page
            if (!Context.Browser.PageUrl.Contains("templates/pagetemplates?"))
            {
                Context.Pages.Editor.TopBar.OpenSitesDropdown().SelectSite(site: Constants.SXAHeadlessSite);
                Context.Pages.TopBar.AppNavigation.OpenTemplates();
            }
            else
            {
                Context.Pages.PageTemplates.TemplatesLHSPanel.OpenPageDesigns();
                Context.Pages.PageTemplates.TemplatesLHSPanel.OpenPageTemplates();
            }
        }

        [TearDown]
        public void DeleteTestData()
        {
            if (TestContext.CurrentContext.Test.MethodName == "SelectsDuplicateOptionOnPageTemplate_DuplicatesPageTemplate")
            {
                var siteTemplates = Context.ApiHelper.PlatformGraphQlClient.GetTenantTemplates(Constants.SXAHeadlessSite);
                var tenantTemplate = siteTemplates.Find(i => i.template.name.Equals(NewPageTemplateName));
                var templateItem = Context.ApiHelper.PlatformGraphQlClient.GetItem(tenantTemplate.template.templateId);
                TestData.Items.Add(templateItem);
            }

            if (TestContext.CurrentContext.Test.MethodName == "NoPageTemplatesAvailable")
            {
                _baseTemplatesList.Add(Constants.SxaBasePageTemplateId);
                foreach (var tenantTemplate in _tenantTemplatesList)
                {
                    Context.ApiHelper.PlatformGraphQlClient.UpdateItemTemplate(tenantTemplate.template.templateId, _baseTemplatesList);
                }
            }
        }

        [OneTimeTearDown]
        public void DeleteDataTemplate()
        {
            Context.ApiHelper.CleanTestData(keepProtected: false);
        }

        internal Item GetTemplateDetails()
        {
            var templateId = Context.ApiHelper.PlatformGraphQlClient.GetTenantTemplates(Constants.SXAHeadlessSite)
                .Find(t => t.template.name.Equals(TemplateA)).template.templateId;
            return Context.ApiHelper.PlatformGraphQlClient.GetItem(templateId);
        }
    }
}
