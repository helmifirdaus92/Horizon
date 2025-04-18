// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using OpenQA.Selenium;
using Sitecore.E2E.Test.Framework;
using Sitecore.Pages.E2EFramework.UI.Tests.Wrappers.Components.RightHandPanel.ElementOptions;

namespace Sitecore.Pages.E2EFramework.UI.Tests.Wrappers.Components.RightHandPanel;

public class RightHandPanel : BaseControl
{
    public RightHandPanel(IWebElement container) : base(container)
    {
    }

    public string HeaderText => _headerSection.Text;
    public string HeaderInFeAASRegion => _headerInFeAASRegion.Text;
    public IWebElement NumericalInput => Container.FindElement("#numericalInput");
    public string NumberInputValidationErrorMessage => Container.FindElement("app-numerical-field label").Text;

    public DesignContentTogle DesignContentTogle => new DesignContentTogle(Container.FindElement("app-toggle-buttons"));
    public ContentSection ContentSection => new ContentSection(Container.FindElement("app-rendering-data-source"));

    public PersonalizationDetails PersonalizationDetails
    {
        get
        {
            return new PersonalizationDetails(Container.FindElement("app-rendering-details-personalized"));
        }
    }

    public PlaceholderDetails PlaceholderDetails
    {
        get
        {
            return new PlaceholderDetails(Container.GetDriver().FindElement("app-placeholder-details"));
        }
    }

    public Image ImageElementOptions => new(Container.FindElement("app-image-field"));
    public Link LinkElementOptions => new(Container.FindElement("app-general-link-field"));

    public PersonalizationSection Personalization => new(Container.FindElement("app-rendering-details-personalized"));

    public List<OrchestratorSectionAccordion> OrchestratorSections => Container.FindElements("app-sitecore-region ng-spd-accordion").ToList().Select(e => new OrchestratorSectionAccordion(e)).ToList();

    public ApplicationTestComponentSection ApplicationTestComponent => new ApplicationTestComponentSection(Container.FindElement("app-test-component"));

    public bool IsApplicationTestComponentSectionExists => Container.CheckElementExists("app-test-component");

    private IWebElement _headerSection => Container.FindElement(".header-section");

    private IWebElement _headerInFeAASRegion => Container.FindElement("app-feaas-rhs-region feaas-picker>div>div>div>p.chakra-text");

    public void LooseFocus()
    {
        _headerSection.Click();
    }
}
