// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using OpenQA.Selenium;
using Sitecore.E2E.Test.Framework;
using Sitecore.E2E.Test.Framework.Controls;

namespace Sitecore.Pages.E2EFramework.UI.Tests.Wrappers.Components.TimedNotification
{
    public class TimedNotification : BaseControl
    {
        public TimedNotification(IWebElement? container) : base(container)
        {
        }

        public string Message => Container.FindElement(".text").Text;
        public NotificationButton Button => new NotificationButton(Container.FindElement(".timed-notification-action"));
        private Button _closeButton => Container.FindControl<Button>(".close-button");

        private IWebElement _link => Container.FindElement("a");

        public string LinkUrl => _link.GetAttribute("href");
        public void Close()
        {
            _closeButton.Click();
        }

        public NotificationType Type => Container.GetClassList().Contains("success") ? NotificationType.Success :
            Container.GetClassList().Contains("warning") ? NotificationType.Warning :
            Container.GetClassList().Contains("info") ? NotificationType.Info :
            NotificationType.Error;
    }
}
