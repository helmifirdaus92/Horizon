// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using System.Collections.Generic;
using System.Linq;
using Sitecore.Horizon.Integration.Tests.Ui.Wrappers.Controls;
using Sitecore.Horizon.Integration.Tests.Ui.Wrappers.Services;
using UTF;

namespace Sitecore.Horizon.Integration.Tests.Ui.Wrappers.Components.RightPanel
{
    public class RightPanel
    {
        private readonly WebElement _rightPanel;
        private JsHelper _domJsObserver;

        public RightPanel(WebElement element)
        {
            _rightPanel = element;
            _domJsObserver = new JsHelper(element.Driver);
        }

        public IExpandable _toggleButton => new ToggleButton(_rightPanel.Driver.FindElement("button.toggle-rhs-hide"),true);
                
        public RenderingDetails RenderingDetails
        {
            get
            {
                Expand();
                return new RenderingDetails(_rightPanel.Driver.FindElement("app-rendering-details"));
            }
        }

        public PlaceholderDetails PlaceholderDetails
        {
            get
            {
                Expand();
                return new PlaceholderDetails(_rightPanel.Driver.FindElement("app-placeholder-details"));
            }
        }

        public RichTextEditor RichTextEditor => new(_rightPanel.FindElement("app-rich-text-editor"));


        public ImageFieldSection ImageFieldSection => new(_rightPanel.FindElement("app-image-field"));

        public GeneralLinkFieldSection GeneralLinkFieldSection => new(_rightPanel.FindElement("app-general-link-field"));

        public NumericalFieldSection NumericalFieldSection => new(_rightPanel.FindElement("app-numerical-field"));

        public bool IsImageFieldSelectionExpanded => _rightPanel.CheckElementExists("app-image-field");

        public string Header => _rightPanel.FindElement(".header-section").Text;

        public VersionsSection VersionsSection => new(_rightPanel.FindElement("app-versions"));
        public WebElement PersonlizationButton => _rightPanel.FindElement("button[data-action='open-personalization-panel']");

        public PersonalizationAccordion Personalization => new(_rightPanel.FindElement("ng-spd-accordion:nth-of-type(1)"));
        public ComponentsPanel ComponentsPanel => new(_rightPanel.FindElement("ng-spd-slide-in-panel:nth-of-type(2)"));

        public VersionsPanel VersionsPanel => new(_rightPanel.FindElement("ng-spd-slide-in-panel:nth-of-type(1)"));
        public CreateVersion CreateVersion => new(_rightPanel.FindElement("ng-spd-slide-in-panel:nth-of-type(2)"));
        public RenameVersion RenameVersion => new(_rightPanel.FindElement("ng-spd-slide-in-panel:nth-of-type(2)"));
        public PublishingDates PublishingDates => new(_rightPanel.FindElement("ng-spd-slide-in-panel:nth-of-type(2)"));
        public SelectionDetails SelectionDetails => new(_rightPanel.FindElement("app-selection-details"));
        public Accordion ContentAccordion => new Accordion(_rightPanel.FindElement("ng-spd-accordion"));

        public bool IsExpanded()
        {
            _rightPanel.Hover();
            return _toggleButton.IsExpanded;
        }


        public ItemInfoPanel ExpandItemDetails()
        {
            Expand();
            Accordion section = SelectionDetails.GetAccordion("Details");
            section.Expand();

            return new ItemInfoPanel(section.Contents);
        }

        public void Expand()
        {
            _rightPanel.Hover();
            _toggleButton.Expand();
        }

        public void Collapse()
        {
            _rightPanel.Hover();
            _toggleButton.Collapse();
        }

        public void GoToVersionsOverview()
        {
            VersionsSection.OpenVersionsOverviewPanel();
        }

        public void GoToPersonlizationPanel()
        {
            PersonlizationButton.Click();
            _rightPanel.FindElement("ng-spd-slide-in-panel").WaitForCSSAnimation();
        }
    }
}
