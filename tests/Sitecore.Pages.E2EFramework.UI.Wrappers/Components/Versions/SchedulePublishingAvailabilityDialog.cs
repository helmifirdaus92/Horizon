// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using OpenQA.Selenium;
using Sitecore.E2E.Test.Framework;
using Sitecore.Pages.E2EFramework.UI.Tests.Wrappers.Controls.Dialog;

namespace Sitecore.Pages.E2EFramework.UI.Tests.Wrappers.Components.Versions;

public class SchedulePublishingAvailabilityDialog : DialogBase
{
    private readonly string StartNowRadioLocator = "input[name='start-options']#currentDate";
    private readonly string StartCustomRadioLocator = "input[name='start-options']#custom";
    private readonly string StartDateLocator = "input[name='startDate']";
    private readonly string NoEndDateRadioLocator = "input[name='end-options']#noEndDate";
    private readonly string EndCustomRadioLocator = "input[name='end-options']#custom";
    private readonly string EndDateLocator = "input[name='endDate']";

    private readonly string JsSetDate = "let dateField = document.querySelector(\"{0}\");" +
        "dateField.value = \"{1}\";" +
        "dateField.dispatchEvent(new Event('input'));";

    private readonly string JsGetDate = "return document.querySelector(\"{0}\").value";

    private readonly string JsRadioChecked = "return document.querySelector(\"{0}\").checked";

    private readonly string DateFormatForDateField = "yyyy-MM-ddTHH:mm:ss";

    public SchedulePublishingAvailabilityDialog(IWebElement container) : base(container)
    {
    }

    public bool SaveEnabled => Buttons.First(b => b.Text.Equals("Save")).Enabled;
    public bool CancelEnabled => Buttons.First(b => b.Text.Equals("Cancel")).Enabled;

    private IWebElement _available => Container.FindElement(".container.available");
    private IWebElement _notAvailable => Container.FindElement(".container.not-available");
    private IWebElement _startNowRadio => Container.FindElement(StartNowRadioLocator);
    private IWebElement _startCustomRadio => Container.FindElement(StartCustomRadioLocator);
    private IWebElement _noEndDateRadio => Container.FindElement(NoEndDateRadioLocator);
    private IWebElement _endCustomRadio => Container.FindElement(EndCustomRadioLocator);
    private IWebElement _startDateInput => Container.FindElement(StartDateLocator);
    private IWebElement _endDateInput => Container.FindElement(EndDateLocator);

    public void SetCustomDates(string startDate, string endDate)
    {
        if (Helpers.TryParseDayTime(startDate, out DateTime publishableFrom))
        {
            SetStartDate(publishableFrom);
        }
        else
        {
            SetStartNow();
        }

        if (Helpers.TryParseDayTime(endDate, out DateTime publishableTo))
        {
            SetEndDate(publishableTo);
        }
        else
        {
            SetNoEndDate();
        }
    }

    public void Save()
    {
        Buttons.First(b => b.Text.Equals("Save")).Click();
        Container.GetDriver().WaitForHorizonIsStable();
    }

    public void Cancel()
    {
        Buttons.First(b => b.Text.Equals("Cancel")).Click();
        Container.GetDriver().WaitForHorizonIsStable();
    }

    public bool IsAvailable()
    {
        return _available.IsSelected();
    }

    public bool IsNotAvailable()
    {
        return _notAvailable.IsSelected();
    }

    public void SetAvailable()
    {
        _available.Click();
    }

    public SchedulePublishingAvailabilityDialog SetNotAvailable()
    {
        _notAvailable.Click();
        return this;
    }

    public void SetStartNow()
    {
        _startNowRadio.Click();
    }

    public bool IsStartNowSelected()
    {
        return Container.GetDriver().ExecuteJavaScript<bool>(string.Format(JsRadioChecked, StartNowRadioLocator));
    }

    public bool StartNowEnabled()
    {
        return _startNowRadio.Enabled;
    }

    public bool IsStartCustomSelected()
    {
        return Container.GetDriver().ExecuteJavaScript<bool>(string.Format(JsRadioChecked, StartCustomRadioLocator));
    }

    public bool StartCustomEnabled()
    {
        return _startCustomRadio.Enabled;
    }

    public void SetStartDate(DateTime dateTime)
    {
        _startCustomRadio.Click();
        ClearStartDate();
        Container.GetDriver().ExecuteJavaScript(string.Format(JsSetDate, StartDateLocator, dateTime.ToString(DateFormatForDateField)));
    }

    public DateTime GetStartDate()
    {
        var date = Container.GetDriver().ExecuteJavaScript<string>(string.Format(JsGetDate, StartDateLocator));
        return Helpers.GetDateFromString(date);
    }

    public void ClearStartDate()
    {
        _startDateInput.Clear();
    }

    public void SetNoEndDate()
    {
        _noEndDateRadio.Click();
    }

    public bool IsNoEndDateSelected()
    {
        return Container.GetDriver().ExecuteJavaScript<bool>(string.Format(JsRadioChecked, NoEndDateRadioLocator));
    }

    public bool NoEndDateEnabled()
    {
        return _noEndDateRadio.Enabled;
    }

    public bool IsCustomEndDateSelected()
    {
        return Container.GetDriver().ExecuteJavaScript<bool>(string.Format(JsRadioChecked, EndCustomRadioLocator));
    }

    public bool CustomEndDateEnabled()
    {
        return _endCustomRadio.Enabled;
    }

    public void SetEndDate(DateTime dateTime)
    {
        _endCustomRadio.Click();
        ClearEndDate();
        Container.GetDriver().ExecuteJavaScript(string.Format(JsSetDate, EndDateLocator, dateTime.ToString(DateFormatForDateField)));
    }

    public DateTime GetEndDate()
    {
        var date = Container.GetDriver().ExecuteJavaScript<string>(string.Format(JsGetDate, EndDateLocator));
        return Helpers.GetDateFromString(date);
    }

    public void ClearEndDate()
    {
        _endDateInput.Clear();
    }
}
