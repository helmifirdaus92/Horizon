// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using OpenQA.Selenium;
using Sitecore.E2E.Test.Framework;

namespace Sitecore.Pages.E2EFramework.UI.Tests.Wrappers.Components.TimedNotification
{
    public class NotificationButton : BaseControl
    {
        public NotificationButton(IWebElement container) : base(container)
        {
        }

        public NotificationButtonType Type
        {
            get
            {
                switch (Container.Text)
                {
                    case "Reload":
                        return NotificationButtonType.Reload;
                    case "Go back":
                        return NotificationButtonType.GoBack;
                    default:
                        return NotificationButtonType.Close;
                }
            }
        }

        public string Text => Container.Text;

        public void Click()
        {
            Container.Click();
            Container.GetDriver().WaitForHorizonIsStable();
        }
    }
}
