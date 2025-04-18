// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using System;
using UTF;

namespace Sitecore.Horizon.Integration.Tests.Ui.Wrappers.Components.RightPanel
{
    public class PublishingDates
    {
        private readonly WebElement _setPublishingDates;
        private readonly string _startDateLocator = "input[name='startDate']";
        private readonly string _endDateLocator = "input[name='endDate']";

        private readonly string _jsSetDate = "let dateField = document.querySelector(\"{0}\");" +
            "dateField.value = \"{1}\";" +
            "dateField.dispatchEvent(new Event('input'));";

        private readonly string _dateFormatForDateField = "yyyy-MM-ddTHH:mm:ss";

        public PublishingDates(WebElement setPublishingDates)
        {
            _setPublishingDates = setPublishingDates;
        }

        public bool StartDateExists => StartDate.Exists;
        public bool EndDateExists => EndDate.Exists;
        public string Header => _setPublishingDates.FindElement("h4").Text;
        public string TimeZone => _setPublishingDates.FindElement("app-version-publishing-settings > p").Text;
        public string CancelButtonText => CancelButton.Text;
        public string SaveButtonText => SaveButton.Text;
        public bool IsSaveBUttonPrimary => SaveButton.GetClassList().Contains("primary");

        private WebElement StartDate => _setPublishingDates.FindElement(_startDateLocator);
        private WebElement EndDate => _setPublishingDates.FindElement(_endDateLocator);
        private WebElement CancelButton => _setPublishingDates.FindElement("app-version-publishing-settings > div > button:nth-of-type(1)");
        private WebElement SaveButton => _setPublishingDates.FindElement("app-version-publishing-settings > div > button:nth-of-type(2)");

        public void SetStartDate(DateTime dateTime)
        {
            ClearStartDate();
            _setPublishingDates.Driver.ExecuteJavaScript(string.Format(_jsSetDate, _startDateLocator, dateTime.ToString(_dateFormatForDateField)));
        }

        public void ClearStartDate()
        {
            StartDate.Clear();
        }

        public void SetEndDate(DateTime dateTime)
        {
            ClearEndDate();
            _setPublishingDates.Driver.ExecuteJavaScript(string.Format(_jsSetDate, _endDateLocator, dateTime.ToString(_dateFormatForDateField)));
        }

        public void ClearEndDate()
        {
            EndDate.Clear();
        }

        public void Save()
        {
            SaveButton.Click();
            _setPublishingDates.WaitForCSSAnimation();
        }

        public void Cancel()
        {
            CancelButton.Click();
            _setPublishingDates.WaitForCSSAnimation();
        }
    }
}
