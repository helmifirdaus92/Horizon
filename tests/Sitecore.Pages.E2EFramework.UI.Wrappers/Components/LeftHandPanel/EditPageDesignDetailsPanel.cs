// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using OpenQA.Selenium;
using Sitecore.E2E.Test.Framework;

namespace Sitecore.Pages.E2EFramework.UI.Tests.Wrappers.Components.LeftHandPanel
{
    //.design-tabs div[class^='edit-page-desing-details-panel']
    public class EditPageDesignDetailsPanel : BaseControl
    {
        //
        public EditPageDesignDetailsPanel(IWebElement container) : base(container)
        {
        }

        private IWebElement NoDataTemplateInformation => Container.FindElement("div[class='text']");
        private IWebElement GoToTemplatesLink => Container.FindElement(".go-to-templates-link");

        private List<IWebElement> TemplatesUsingPageDesign => Container.FindElements("ul li").ToList();

        public string GetNoDataTemplateInformationText()
        {
            return NoDataTemplateInformation.Text;
        }

        public List<string> GetTemplatesUsingPageDesign()
        {
            return TemplatesUsingPageDesign.Select(el => el.Text).ToList();
        }

        public void GoToTemplates()
        {
            GoToTemplatesLink.Click();
        }
    }
}
