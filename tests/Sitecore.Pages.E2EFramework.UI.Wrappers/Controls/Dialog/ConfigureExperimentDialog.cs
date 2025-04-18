// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using OpenQA.Selenium;
using Sitecore.E2E.Test.Framework;
using Sitecore.E2E.Test.Framework.Controls;
using Sitecore.Pages.E2EFramework.UI.Tests.Wrappers.Components.Analytics;
using Sitecore.Pages.E2EFramework.UI.Tests.Wrappers.Components.Items;

namespace Sitecore.Pages.E2EFramework.UI.Tests.Wrappers.Controls.Dialog
{
    public class ConfigureExperimentDialog : DialogBase
    {
        public ConfigureExperimentDialog(IWebElement container) : base(container)
        {
        }

        public string ValidationErrorMsg => Container.FindElement(".error-block p").Text;


        public bool IsDisplayed => Container.Displayed;

        public CheckBox IncreasePageViews => Container.FindControl<CheckBox>("input#pageView");

        public CheckBox DecreaseBounceRate => Container.FindControl<CheckBox>("input#bounceRate");

        public CheckBox DecreaseExitRate => Container.FindControl<CheckBox>("input#trackExit");

        public DropList ActionForWinningVariant => new(Container.FindElement("ng-spd-accordion.on-completion .flex-row:nth-of-type(2) ng-spd-droplist"));

        public DropList ActionForInconclusive => new(Container.FindElement("ng-spd-accordion.on-completion .flex-row:nth-of-type(4) ng-spd-droplist"));

        public IList<IWebElement> GoalTags => Container.FindElements("ng-spd-accordion .goals-container app-tag.goal");

        public ItemsTree PagesTree => new(Container.FindElement("app-item-tree"), canvasReloadWaitMethod: null);

        private TextBox ExperimentNameField => Container.FindControl<TextBox>("input#experiment-name");

        public void ClickCancelButton() { ClickActionButton("Cancel"); }

        public void ClickSaveButton() { ClickActionButton("Save"); }

        public ConfigureExperimentDialog EnterExperimentName(string name)
        {
            ExperimentNameField.Clear();
            ExperimentNameField.Text = name;
            return this;
        }

        public void EnsureCheckboxChecked(CheckBox checkBox)
        {
            if (!checkBox.Checked)
            {
                checkBox.Container.Click();
            }
        }

        public void CheckIncreasePageViews()
        {
            EnsureCheckboxChecked(IncreasePageViews);
        }

        public void CheckDecreaseBounceRate()
        {
            EnsureCheckboxChecked(DecreaseBounceRate);
        }

        public void CheckDecreaseExitRate()
        {
            EnsureCheckboxChecked(DecreaseExitRate);
        }

        public ConfigureExperimentDialog SelectPageForPageViewGoal(string pageName)
        {
            Container.FindElement(".goals-accordion-container>ng-spd-accordion-header>button").Click();
            Container.GetDriver().WaitForHorizonIsStable();
            if (PagesTree.GetItemByPath(pageName) != null)
            {
                PagesTree.GetItemByPath(pageName)!.Select(false);
            }
            else
            {
                Logger.Write("Page not found in the tree, check the path of the page");
            }

            return this;
        }

        public void ExpandAssignTrafficAccordion()
        {
            IWebElement accordionHeader = Container.FindElement(("ng-spd-accordion.traffic-splits ng-spd-accordion-header"));
            bool isExpanded = Container.FindElement(("ng-spd-accordion.traffic-splits span.mdi")).GetAttribute("class").Contains("expanded");
            if (!isExpanded)
            {
                IWebElement accordionButton = accordionHeader.FindElement(("button"));
                accordionButton.Click();
                Container.GetDriver().WaitForHorizonIsStable();
            }
        }

        public void CollapseAssignTrafficAccordion()
        {
            
            IWebElement accordionHeader = Container.FindElement(("ng-spd-accordion.traffic-splits ng-spd-accordion-header"));
            bool isExpanded = Container.FindElement(("ng-spd-accordion.traffic-splits span.mdi"))
                .GetAttribute("class").Contains("expanded");

            if (isExpanded)
            {
                IWebElement accordionButton = accordionHeader.FindElement(("button"));
                accordionButton.Click();

                Container.GetDriver().WaitForHorizonIsStable();
            }
        }

        public string GetAssignTrafficSummary()
        {
            IWebElement headerOptionsInfo = Container.FindElement(By.CssSelector(".header-options-info"));
            var summaryParts = headerOptionsInfo.FindElements(By.CssSelector(".text-subtle"));
            var summaryText = string.Join(" ", summaryParts.Select(part => part.Text));
            return summaryText;
        }

        public void ExpandSelectPagesAccordion()
        {
            IWebElement accordionHeader = Container.FindElement(("ng-spd-accordion.goals-accordion-container ng-spd-accordion-header"));
            bool isExpanded = Container.FindElement(("ng-spd-accordion.goals-accordion-container ng-spd-accordion-content")).GetAttribute("class").Contains("open");
            if (!isExpanded)
            {
                IWebElement accordionButton = accordionHeader.FindElement(("button"));
                accordionButton.Click();
                Container.GetDriver().WaitForHorizonIsStable();
            }
        }

        public void SetTrafficAllocation(string variantName, int percentage)
        {
            IWebElement variantTrafficInput = Container.FindElement(($"input[name='{variantName}Traffic']"));
            variantTrafficInput.Clear();
            variantTrafficInput.SendKeys(percentage.ToString());
            Container.GetDriver().WaitForHorizonIsStable();
        }

        public void EvenlyDistributeTraffic()
        {
            Container.FindElement("ng-spd-accordion.traffic-splits button.xs.rounded").Click();
        }

        public int GetTrafficAllocation(string variantName)
        {
            IWebElement variantTrafficInput = Container.FindElement(By.CssSelector($"input[name='{variantName}Traffic']"));
            string value = variantTrafficInput.GetAttribute("value");
            return int.Parse(value);
        }

        public string GetTrafficAllocationWarning()
        {
            var warningElement = Container.FindElement(".splits-error");
            return warningElement.Text;
        }

        public bool CheckIfTrafficAllocationWarningExists()
        {
            Container.GetDriver().WaitForHorizonIsStable();
            bool warningExists = Container.CheckElementExists(".splits-error");
            return warningExists;
        }

        // Automated actions
        public void ExpandAutomatedActionsAccordion()
        {
            IWebElement accordionHeader = Container.FindElement(("ng-spd-accordion.on-completion ng-spd-accordion-header"));
            bool isExpanded = Container.FindElement(("ng-spd-accordion.on-completion ng-spd-accordion-content")).GetAttribute("class").Contains("open");
            if (!isExpanded)
            {
                IWebElement accordionButton = accordionHeader.FindElement(("button"));
                accordionButton.Click();
                Container.GetDriver().WaitForHorizonIsStable();
            }
        }

        public void SelectIfThereIsAWinningVariant(string option)
        {
            ActionForWinningVariant.SelectDropListItem(option);
        }

        public void SelectIfTestIsInconclusive(string option)
        {
            ActionForInconclusive.SelectDropListItem(option);
        }

        public string GetSelectedOptionFromIfThereIsAWinningVariantDropList()
        {
            ActionForWinningVariant.Open();
            return ActionForWinningVariant.SelectedValue;
        }

        public string GetSelectedOptionFromIfTestsIsInconclusiveDropList()
        {
            ActionForInconclusive.Open();
            return ActionForInconclusive.SelectedValue;
        }

        //Advanced options
        public void ExpandAdvancedOptionsAccordion()
        {
            IWebElement accordionHeader = Container.FindElement(By.CssSelector("ng-spd-accordion.advance-options ng-spd-accordion-header"));
            bool isExpanded = Container.FindElement(By.CssSelector("ng-spd-accordion.advance-options ng-spd-accordion-content")).GetAttribute("class").Contains("open");
            if (!isExpanded)
            {
                IWebElement accordionButton = accordionHeader.FindElement(By.CssSelector("button"));
                accordionButton.Click();
                Container.GetDriver().WaitForHorizonIsStable();
            }
        }

        public void SetTrafficAllocationOfVisitorsThatWillSeeThisTest(int percentValue)
        {
            IWebElement percentValueInput = Container.FindElement("input[name='trafficAllocation']");
            percentValueInput.Clear();
            percentValueInput.SendKeys(percentValue.ToString());
            Container.GetDriver().WaitForHorizonIsStable();
        }

        public double GetTrafficAllocationOfVisitorsThatWillSeeThisTest()
        {
            IWebElement percentValueInput = Container.FindElement("input[name='trafficAllocation']");
            string value = percentValueInput.GetAttribute("value");
            return double.Parse(value);
        }

        public void SetBaseRate(double baseRate)
        {
            IWebElement baseRateInput = Container.FindElement("input[name='baseRate']");
            baseRateInput.Clear();
            baseRateInput.SendKeys(baseRate.ToString());
            Container.GetDriver().WaitForHorizonIsStable();
        }

        public double GetBaseRate()
        {
            IWebElement baseRateInput = Container.FindElement("input[name='baseRate']");
            string value = baseRateInput.GetAttribute("value");
            return double.Parse(value);
        }

        public void SetMinimumDetectableDifference(double difference)
        {
            IWebElement differenceInput = Container.FindElement("input[name='minDifference']");
            differenceInput.Clear();
            differenceInput.SendKeys(difference.ToString());
            Container.GetDriver().WaitForHorizonIsStable();
        }

        public double GetMinimumDetectableDifference()
        {
            IWebElement differenceInput = Container.FindElement("input[name='minDifference']");
            string value = differenceInput.GetAttribute("value");
            return double.Parse(value);
        }

        public void SetConfidenceLevel(double confidenceLevel)
        {
            IWebElement confidenceInput = Container.FindElement("input[name='confidence']");
            confidenceInput.Clear();
            confidenceInput.SendKeys(confidenceLevel.ToString());
            Container.GetDriver().WaitForHorizonIsStable();
        }

        public double GetConfidenceLevel()
        {
            IWebElement confidenceInput = Container.FindElement("input[name='confidence']");
            string value = confidenceInput.GetAttribute("value");
            return double.Parse(value);
        }

        public string GetTotal()
        {
            return Container.FindElement("app-configure-experiment-dialog .text-bold > p:nth-child(2)").Text;
        }

        public void ResetToDefault()
        {
            Container.FindElement("button.reset-config").Click();
        }

        public bool IsGoalTagPresent(string tagName)
        {
            foreach (var tag in GoalTags)
            {
                if (tag.Text.Contains(tagName))
                {
                    return true;
                }
            }

            return false;
        }

        public void CloseGoalTag(string tagName)
        {
            foreach (var tag in GoalTags)
            {
                if (tag.Text.Contains(tagName))
                {
                    var closeButton = tag.FindElement(By.CssSelector("button.mdi-close"));
                    closeButton.Click();
                    Container.GetDriver().WaitForHorizonIsStable();
                    break;
                }
            }
        }
    }
}
