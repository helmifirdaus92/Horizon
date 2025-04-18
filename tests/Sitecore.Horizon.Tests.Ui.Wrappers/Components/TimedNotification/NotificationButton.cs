// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using UTF;

namespace Sitecore.Horizon.Integration.Tests.Ui.Wrappers.Components.TimedNotification
{
    public class NotificationButton
    {
        private readonly WebElement _container;

        public NotificationButton(WebElement container)
        {
            _container = container;
        }

        public NotificationButtonType Type
        {
            get
            {
                switch (_container.Text)
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

        public string Text => _container.Text;

        public void Click()
        {
            _container.Click();
            _container.Driver.WaitForHorizonIsStable();
        }
    }
}
