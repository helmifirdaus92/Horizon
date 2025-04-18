// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using System;
using System.Globalization;

namespace Sitecore.Horizon.Integration.Tests.Ui.ApiHelpers.HelperClasses
{
    public static class DateTimeHelper
    {
        public static DateTime ParseDateTimeString(string date, DateTime? defaultValueIfNull = null)
        {
            date = date.Replace("T", "").Replace("Z", "");
            if (string.IsNullOrEmpty(date))
            {
                return (DateTime)defaultValueIfNull;
            }

            return DateTime.ParseExact(date, "yyyyMMddHHmmss", CultureInfo.InvariantCulture);
        }

        public static string GetFormattedDateTime(DateTime? dateTime)
        {
            string formattedDateTime = "";
            if (dateTime != null)
            {
                var dateTimeValue = (DateTime)dateTime;
                formattedDateTime = $"{dateTimeValue.Year + dateTimeValue.Month.ToString("D2") + dateTimeValue.Day.ToString("D2")}" +
                    $"T{dateTimeValue.Hour.ToString("D2") + dateTimeValue.Minute.ToString("D2") + dateTimeValue.Second.ToString("D2")}Z";
            }

            return formattedDateTime;
        }
    }
}
