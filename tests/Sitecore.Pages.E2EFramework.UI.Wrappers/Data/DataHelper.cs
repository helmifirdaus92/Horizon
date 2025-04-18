// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using System.Text;

namespace Sitecore.Pages.E2EFramework.UI.Tests.Wrappers.Data
{
    public static class DataHelper
    {
        public static string GetPlaceholderSelector(string placeholderName) =>
            $"[key = '{placeholderName}'][kind='open'] ~ :not(code)";

        public static string GetRenderingSelector(string renderingName) =>
            $"[hintname = '{renderingName}'][kind='open'] ~ :not(code)";

        public static (string, string) GetPlaceholderSelectors(string placeholderName) =>
            ($"[key = '{placeholderName}'][kind='open']", $"[key = '{placeholderName}'][kind='open'] ~ :not(code)");

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

        /*Simplifying itemId by removing unwanted characters*/
        public static string FormatItemId(string itemId)
        {
            var charsToRemove = new HashSet<char>
            {
                '-',
                '{',
                '}'
            };
            var result = new StringBuilder(itemId.Length);

            foreach (char c in itemId.Where(c => !charsToRemove.Contains(c)))
            {
                result.Append(c);
            }

            return result.ToString();
        }

        public static string RandomString()
        {
            return Guid.NewGuid().ToString("N");
        }
    }
}
