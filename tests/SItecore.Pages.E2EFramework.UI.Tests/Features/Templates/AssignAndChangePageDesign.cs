// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using FluentAssertions;
using NUnit.Framework;
using Sitecore.E2E.Test.Framework;
using Sitecore.Pages.E2EFramework.UI.Tests.ApiHelpers.PlatformGraphQL.Types;
using Sitecore.Pages.E2EFramework.UI.Tests.Helpers;
using Sitecore.Pages.E2EFramework.UI.Tests.Wrappers.Components.Templates;
using Sitecore.Pages.E2EFramework.UI.Tests.Wrappers.Data;
using Constants = Sitecore.Pages.E2EFramework.UI.Tests.Helpers.Constants;

namespace Sitecore.Pages.E2EFramework.UI.Tests.Features.Templates;

public class AssignAndChangePageDesign : BaseFixture
{
    private string TemplateName = "Template A";
    private string PageDesignName = "Page Design A";

    [SetUp]
    public void CreateTemplateAndPageDesign()
    {
        // Create new template
        TemplateName += DataHelper.RandomString();
        Preconditions.CreateTemplate(TemplateName, Constants.SxaHeadlessSiteTemplatesParentId, new List<string>()
        {
            Constants.SxaBasePageTemplateId
        });

        // Open templates page
        if (!Context.Browser.PageUrl.Contains("templates/pagetemplates?"))
        {
            Context.Pages.TopBar.OpenSitesDropdown().SelectSite(site: Constants.SXAHeadlessSite);
            Context.Pages.TopBar.AppNavigation.OpenTemplates();
        }
        else
        {
            Context.Pages.PageTemplates.TemplatesLHSPanel.OpenPageDesigns();
            Context.Pages.PageTemplates.TemplatesLHSPanel.OpenPageTemplates();
        }
    }

    [Test]
    public void AssignAndChangePagesDesignToTemplate()
    {
        // Create new page design
        Item pageDesign = Preconditions.CreatePageDesign(PageDesignName, Constants.PageDesignsItemId);

        // Invoke Page Design dialog
        Context.Pages.PageTemplates.TemplateInfoByName(TemplateName).InvokePageDesignDialog();
        CheckPageDesignDialogOpened();

        // Choose Default page design
        Context.Pages.PageTemplates.PageDesignDialog.IsSaveEnabled.Should().BeFalse();
        Context.Pages.PageTemplates.PageDesignDialog.SelectPageDesignCard("Default");
        Context.Pages.PageTemplates.PageDesignDialog.IsSaveEnabled.Should().BeTrue();
        Context.Pages.PageTemplates.PageDesignDialog.ClickSaveButton();

        TemplateInfo template = Context.Pages.PageTemplates.TemplateInfoByName(TemplateName);
        template.AssociatedPageDesign.Should().Be("Default");

        // Cancel page design dialog not changing associated page design
        template.InvokePageDesignDialog();
        CheckPageDesignDialogOpened();
        Context.Pages.PageTemplates.PageDesignDialog.ClickCancelButton();
        template = Context.Pages.PageTemplates.TemplateInfoByName(TemplateName);
        template.AssociatedPageDesign.Should().Be("Default");

        // Change page design for Template A to Page Design A
        template.InvokePageDesignDialog();
        CheckPageDesignDialogOpened();
        Context.Pages.PageTemplates.PageDesignDialog.IsSaveEnabled.Should().BeFalse();
        Context.Pages.PageTemplates.PageDesignDialog.SelectPageDesignCard(PageDesignName);
        Context.Pages.PageTemplates.PageDesignDialog.IsSaveEnabled.Should().BeTrue();

        // Open preview for selected variant
        Context.Pages.PageTemplates.PageDesignDialog.OpenPreviewForSelectedDesign();
        Context.Browser.SwitchToTab("sc_horizon=preview");
        Context.Pages.Preview.IsOpened().Should().BeTrue();
        Context.Browser.PageUrl.Replace("-", "").Should().Contain($"sc_itemid={pageDesign.itemId}");
        Context.Browser.SwitchToTab("templates/pagetemplates");

        Context.Pages.PageTemplates.PageDesignDialog.ClickSaveButton();

        template = Context.Pages.PageTemplates.TemplateInfoByName(TemplateName);
        template.AssociatedPageDesign.Should().Be(PageDesignName);
    }

    [Test]
    public void RemovePageDesignAssignedToTemplate()
    {
        // Assign Default page design
        Context.Pages.PageTemplates.TemplateInfoByName(TemplateName).InvokePageDesignDialog();
        CheckPageDesignDialogOpened();
        Context.Pages.PageTemplates.PageDesignDialog.IsSaveEnabled.Should().BeFalse();
        Context.Pages.PageTemplates.PageDesignDialog.SelectPageDesignCard("Default");
        Context.Pages.PageTemplates.PageDesignDialog.IsSaveEnabled.Should().BeTrue();
        Context.Pages.PageTemplates.PageDesignDialog.ClickSaveButton();
        TemplateInfo template = Context.Pages.PageTemplates.TemplateInfoByName(TemplateName);
        template.AssociatedPageDesign.Should().Be("Default");

        // Remove page design from template
        template.InvokePageDesignDialog();
        CheckPageDesignDialogOpened();
        Context.Pages.PageTemplates.PageDesignDialog.AssignedPageDesign().Title.Should().Be("Default");
        Context.Pages.PageTemplates.PageDesignDialog.Deselect();
        Context.Pages.PageTemplates.PageDesignDialog.IsSaveEnabled.Should().BeTrue();
        Context.Pages.PageTemplates.PageDesignDialog.ClickSaveButton();

        Context.Pages.PageTemplates.TemplateInfoByName(TemplateName).AssociatedPageDesign.Should().Be("NONE SET");

        TenantTemplate tenantTemplate = Context.ApiHelper.PlatformGraphQlClient.GetTenantTemplates(Constants.SXAHeadlessSite)
            .Find(t => t.template.name.Equals(TemplateName));
        tenantTemplate.pageDesign.Should().BeNull();
    }

    private static void CheckPageDesignDialogOpened()
    {
        List<PageDesign> pageDesigns = Context.ApiHelper.PlatformGraphQlClient.GetPageDesigns(Constants.SXAHeadlessSite);
        if (pageDesigns.Count > 0)
        {
            Context.Pages.PageTemplates.PageDesignDialog.WaitForCondition(d => d.PageDesignCards.Count > 0);
        }

        Context.Pages.PageTemplates.PageDesignDialog.PageDesignCards.Count.Should().Be(pageDesigns.Count);
    }
}
