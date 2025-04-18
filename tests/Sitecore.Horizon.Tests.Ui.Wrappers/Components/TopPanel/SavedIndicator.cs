// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using UTF;

namespace Sitecore.Horizon.Integration.Tests.Ui.Wrappers.Components.TopPanel
{
    public class SavedIndicator
    {
        private readonly WebElement _savedIndicator;

        public SavedIndicator(WebElement element)
        {
            _savedIndicator = element;
        }

        public SavedIndicatorStatus SaveStatus
        {
            get
            {
                var indicatorClass = _savedIndicator.GetClass();
                if (indicatorClass.Contains("spd-success"))
                {
                    return SavedIndicatorStatus.Successful;
                }

                if (indicatorClass.Contains("spd-warning"))
                {
                    return SavedIndicatorStatus.Failed;
                }

                return SavedIndicatorStatus.InProgress;
            }
        }
    }
}
