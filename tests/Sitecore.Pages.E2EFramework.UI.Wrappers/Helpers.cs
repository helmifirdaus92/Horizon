// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using System.Globalization;
using System.Text;
using System.Text.RegularExpressions;

namespace Sitecore.Pages.E2EFramework.UI.Tests.Wrappers
{
    public static class Helpers
    {
        public static string GetAndFormatDateAsString(string dateValue, string? format = null)
        {
            format ??= "MMM d, yyyy, h:mm:ss tt";
            DateTime dateTime = DateTime.ParseExact(dateValue, "yyyyMMddTHHmmssZ", null);
            return dateTime.ToString(format, CultureInfo.CreateSpecificCulture("en-US"));
        }
        public static string GetFormattedDateString(DateTime dateTime)
        {
            return dateTime.Year + dateTime.Month.ToString("D2") + dateTime.Day.ToString("D2") +
                $"T{dateTime.Hour.ToString("D2") + dateTime.Minute.ToString("D2") + dateTime.Second.ToString("D2")}Z";
        }

        public static DateTime GetDateFromString(string dateValue, string? format = null)
        {
            format ??= "yyyy-MM-ddTHH:mm";
            DateTime dateTime = DateTime.ParseExact(dateValue, format, CultureInfo.CreateSpecificCulture("en-US"));
            return dateTime;
        }

        public static DateTime TruncatedDateTimeToMinutes()
        {
            var now = DateTime.Now;
            return new DateTime(now.Year, now.Month, now.Day, now.Hour, now.Minute, 0);
        }


        public static bool TryParseDayTime(string inputStringDateTime, out DateTime parsedValue, string timeFormat = "T00:00:00") //Expected format example: Today+5/T11:44:55 (11-hour, 44-minutes, 55-seconds)
        {
            var dateTimeArray = inputStringDateTime.Split('/');

            string daysToAddString = dateTimeArray.First();
            daysToAddString = daysToAddString.Replace("Today", "").Replace(" ", "");
            daysToAddString = string.IsNullOrEmpty(daysToAddString) && inputStringDateTime.Contains("Today") ? "0" : daysToAddString;
            if (!int.TryParse(daysToAddString, out int daysToAdd))
            {
                parsedValue = DateTime.MinValue;
                return false;
            }

            var date = DateTime.Today.AddDays(daysToAdd);
            string time = dateTimeArray.Length > 1 ? dateTimeArray[1] : timeFormat;

            string dateTimeForParsing = $"{date.Year}-{date.Month}-{date.Day}{time}";
            return DateTime.TryParse(dateTimeForParsing, out parsedValue);
        }

        public static Dictionary<string, string> ExtractUrlParameters(string input)
        {
            var extractedValues = new Dictionary<string, string>();

            string pattern = @"(?:\?|&)([^=]+)=([^&]+)";
            MatchCollection matches = Regex.Matches(input, pattern);

            foreach (Match match in matches)
            {
                string key = match.Groups[1].Value;
                string value = match.Groups[2].Value;
                extractedValues[key] = value;
            }

            return extractedValues;
        }

        public static string GenerateLongString(int desiredLength)
        {
            string validChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
            StringBuilder sb = new StringBuilder();
            Random random = new Random();

            while (sb.Length < desiredLength)
            {
                int randomIndex = random.Next(validChars.Length);
                char randomChar = validChars[randomIndex];
                sb.Append(randomChar);
            }

            return sb.ToString();
        }

        public static string ConvertItemIdToGuid(string itemId)
        {
            return itemId.Insert(8, "-").Insert(13, "-").Insert(18, "-").Insert(23, "-");
        }

        public static string FormImageSourceString(string imageItemId) => $"<image mediaid=\"{{{ConvertItemIdToGuid(imageItemId)}}}\"/>";

    }
}
