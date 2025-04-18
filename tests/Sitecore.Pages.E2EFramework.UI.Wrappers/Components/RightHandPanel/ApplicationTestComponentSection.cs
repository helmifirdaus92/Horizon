// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using OpenQA.Selenium;
using Sitecore.E2E.Test.Framework;
using Sitecore.E2E.Test.Framework.Controls;
using Sitecore.Pages.E2EFramework.UI.Tests.Wrappers.Components.LeftHandPanel;
using Sitecore.Pages.E2EFramework.UI.Tests.Wrappers.Controls;
using Sitecore.Pages.E2EFramework.UI.Tests.Wrappers.Controls.Dialog;
using Sitecore.Pages.E2EFramework.UI.Tests.Wrappers.Data;

namespace Sitecore.Pages.E2EFramework.UI.Tests.Wrappers.Components.RightHandPanel
{
    public class ApplicationTestComponentSection : BaseControl
    {
        // app-test-component
        public ApplicationTestComponentSection(IWebElement container) : base(container)
        {
        }

        public string DatasourcePath => DataSourceInput.GetTitle();

        public string VariantActionText => Container.FindElement(".variant-action-type-text").Text;

        public ComponentGallery ComponentGallery => new(Container.FindElement(Constants.ComponentsGallerySelector));

        private IWebElement DataSourceInput => Container.FindElement("div input");

        private IWebElement HeaderSection => Container.FindElement(".header-section:first-child");

        private IWebElement AssignItemButton => Container.FindElement("div.datasource button");

        private IWebElement HeaderSectionSubHeader => Container.FindElement(".header-section.sub-header");

        private IWebElement ActionButton => HeaderSectionSubHeader.FindElement("button.rounded");

        private IWebElement ConfigureButton => HeaderSectionSubHeader.FindElement("button.configure-experiment");

        private string ExperimentStatus => HeaderSectionSubHeader.FindElement("span").Text;

        private List<IWebElement> VariantTabs => new(
            Container.FindElements(("button.variant-tab-btn:not(.add-new)"))
        );

        private IWebElement AddNewVariantButton => Container.FindElement(("button.add-new.variant-tab-btn"));

        private IWebElement ContentMenuDots => Container.FindElement("button[icon=dots-horizontal]");

        private TextBox InputField => Container.FindControl<TextBox>("input");

        public string VariantName => Container.FindElement(".variant-name-section .name-text").Text;

        private List<IWebElement> PersonalizeOptionsButtons => new List<IWebElement>(
            Container.FindElements((".personalize-options button"))
        );

        private IWebElement DeleteABnTestButton => Container.FindElement("button.default[title=\"Delete A/B/n test\"]");

        public string GetExperimentName()
        {
            return HeaderSection.Text;
        }

        public void StartExperiment()
        {
            ActionButton.Click();
        }
        public void EndExperiment(string variantName="(control)")
        {
            ActionButton.Click();
            Container.GetDriver().WaitForHorizonIsStable();
            var dialog = new EndExperimentDialog(Container.GetDriver().FindElement("app-end-experiment-dialog"));
            dialog.SelectVariantByName(variantName);
            dialog.ClickSaveButton();
        }

        public void SelectVariantByName(string variantName)
        {
            var variant = VariantTabs.FirstOrDefault(tab => tab.GetAttribute("title") == variantName);
            if (variant != null)
            {
                variant.Click();
            }
            else
            {
                throw new NoSuchElementException($"Variant with name '{variantName}' not found");
            }
        }

        public void ClickAddNewVariant()
        {
            AddNewVariantButton.Click();
        }

        public string GetExperimentStatus()
        {
            return ExperimentStatus;
        }

        // app-variant-actions-context-menu
        public ContextMenu InvokeContextMenuOnVariant()
        {
            ContentMenuDots.Click();
            return Container.GetDriver().GetContextMenuOnButton();
        }

        // reset variant
        public ResetDialog InvokeResetVariantDialog()
        {
            InvokeContextMenuOnVariant().InvokeResetVariant();
            return new ResetDialog(Container.GetDriver().FindElement(Constants.WarningDialogLocator));
        }

        public void WaitForLoaderToDisappear()
        {
            Container.WaitForCondition(_ => !Container.CheckElementExists("ng-spd-loading-indicator"));
        }

        // rename variant
        public void RenameVariant(string newVariantName)
        {
            InvokeContextMenuOnVariant().InvokeRenameVariant();

            InputField.Clear();
            InputField.Text = newVariantName;
            LooseFocus();
            Container.GetDriver().WaitForHorizonIsStable();
        }

        // delete variant
        public DeleteDialog GetDeleteVariantDialog()
        {
            InvokeContextMenuOnVariant().InvokeDeleteVariant();
            return new DeleteDialog(Container.GetDriver().FindElement(Constants.WarningDialogLocator));
        }

        // click on personalize option
        private void ClickOnPersonalizeOption(string option)
        {
            var button = PersonalizeOptionsButtons.FirstOrDefault(btn => btn.Text.Trim().Equals(option));
            if (button != null)
            {
                button.Click();
            }
            else
            {
                throw new NoSuchElementException($"Option with name '{option}' not found");
            }
        }

        //swap with another component
        public void SwapWithAnotherComponent(string component)
        {
            ClickOnPersonalizeOption("Swap with another component");
            ComponentGallery.SelectComponentThumbnail(component);
            Container.GetDriver().WaitForHorizonIsStable();
        }

        // copy original component
        public void CopyOriginalComponent()
        {
            ClickOnPersonalizeOption("Copy original component");
            Container.GetDriver().WaitForHorizonIsStable();
        }

        public void HideComponent()
        {
            ClickOnPersonalizeOption("Hide component");
            Container.GetDriver().WaitForHorizonIsStable();
        }

        public DatasourceDialog AssignItem()
        {
            AssignItemButton.Click();
            return new DatasourceDialog(Container.GetDriver().FindElement("app-datasource-dialog"));
        }

        public DeleteDialog GetDeleteABnTestDialog()
        {
            DeleteABnTestButton.Click();
            Container.GetDriver().WaitForHorizonIsStable();
            return new DeleteDialog(Container.GetDriver().FindElement(Constants.WarningDialogLocator));
        }

        public ConfigureExperimentDialog OpenConfigureExperimentDialog()
        {
            ConfigureButton.Click();
            return new ConfigureExperimentDialog(Container.GetDriver().FindElement("app-configure-experiment-dialog"));
        }

        public StartTestCheckList GetStartTestCheckList()
        {
          Container.GetDriver().WaitForCondition(c => IsPopoverOpened());
          return new StartTestCheckList(Container.GetDriver().FindElement("app-start-test-check-list"));
        }

        private bool IsPopoverOpened()
        {
            Container.GetDriver().WaitForHorizonIsStable();
            return Container.GetDriver().CheckElementExists("ng-spd-popover-wrapper");
        }

        public void LooseFocus()
        {
            HeaderSection.Click();
        }

    }
}
