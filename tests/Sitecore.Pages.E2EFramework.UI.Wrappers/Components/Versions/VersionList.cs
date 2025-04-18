// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using OpenQA.Selenium;
using Sitecore.E2E.Test.Framework;
using Sitecore.E2E.Test.Framework.Controls;
using Sitecore.Pages.E2EFramework.UI.Tests.Wrappers.Controls;
using Sitecore.Pages.E2EFramework.UI.Tests.Wrappers.Controls.Dialog;
using Sitecore.Pages.E2EFramework.UI.Tests.Wrappers.Data;
using Action = System.Action;

namespace Sitecore.Pages.E2EFramework.UI.Tests.Wrappers.Components.Versions
{
    public class VersionList : BaseControl
    {
        private readonly Action _canvasReloadWaitMethod;

        public VersionList(IWebElement container, Action canvasReloadWaitMethod) : base(container)
        {
            _canvasReloadWaitMethod = canvasReloadWaitMethod;
        }

        public bool CreateVersionButtonEnabled => CreateVersionButton.IsEnabled;

        public List<Version> Versions => Container.FindElements("[role=listitem]").ToList().ConvertAll(WebElementToVersion);
        private Button CreateVersionButton => Container.FindControl<Button>(".footer-section button");

        public CreateDialog OpenCreateVersionDialog()
        {
            CreateVersionButton.Click();
            Container.GetDriver().WaitForHorizonIsStable();
            return new(Container.GetDriver().FindElement(Constants.DialogPanelLocator));
        }

        public ContextMenu? OpenContextMenuOnVersion(int version)
        {
            Versions
                .WaitForCondition(vl => vl
                    .TrueForAll(v => v._numberString != ""));
            Version? v = Versions
                .Find(v => v
                    .Number.Equals(version));
            return v?.InvokeContextMenu();
        }

        /*
         * Selects a version from versions dropdown
         * To be invoked with isVersionExpectedInContext set to true, if the version is expected to be in context before selection
         * this is to avoid wait for a new page load in canvas
         */
        public bool SelectVersion(int version,bool isVersionExpectedInContext=false)
        {
            Versions
                .WaitForCondition(vl => vl
                    .TrueForAll(v => v._numberString != ""));
            Version? v = Versions
                .Find(v => v
                    .Number.Equals(version));
            v?.Select(isVersionExpectedInContext);
            return v != null;
        }

        private Version WebElementToVersion(IWebElement element)
        {
            return new Version(element, _canvasReloadWaitMethod);
        }
    }
}
