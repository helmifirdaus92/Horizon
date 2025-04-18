// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using OpenQA.Selenium;
using Sitecore.E2E.Test.Framework;
using Sitecore.E2E.Test.Framework.Controls;

namespace Sitecore.Pages.E2EFramework.UI.Tests.Wrappers.Components.LeftHandPanel
{
    public class AngularControl : Modal
    {
        public AngularControl(IWebElement container) : base(container)
        {
        }

        public new IWebElement Container
        {
            get
            {
                base.Container.GetDriver().WaitForAngular();
                return base.Container;
            }
        }
    }
}
