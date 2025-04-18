// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using UTF;

namespace Sitecore.Horizon.Integration.Tests.Ui.Wrappers.Components.TimedNotification
{
    public class TimedNotification
    {
        private readonly WebElement _container;

        public TimedNotification(WebElement container)
        {
            _container = container;
        }

        public string Message => _container.FindElement(".text").Text;
        public NotificationButton Button => new NotificationButton(_container.FindElement(".timed-notification-action"));

        public NotificationType Type => _container.GetClassList().Contains("success") ? NotificationType.Success :
            _container.GetClassList().Contains("warning") ? NotificationType.Warning :
            _container.GetClassList().Contains("info") ? NotificationType.Info :
            NotificationType.Error;
    }
}
