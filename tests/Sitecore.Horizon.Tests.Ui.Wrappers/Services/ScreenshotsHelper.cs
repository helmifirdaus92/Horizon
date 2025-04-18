// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using System;
using System.Collections.Generic;
using System.Drawing;
using System.IO;
using System.Linq;
using UTF;

namespace Sitecore.Horizon.Integration.Tests.Ui.Wrappers.Services
{
    public static class ScreenshotsHelper
    {
        public const double MaxWidth = 1280;
        public const double MaxHeight = 1024;

        public static string GetValidScreenShotImageName(string initialPath)
        {
            char[] invalidChars = Path.GetInvalidFileNameChars();

            var invalidCharsRemoved = new string(initialPath
                .Where(x => !invalidChars.Contains(x))
                .ToArray());
            invalidCharsRemoved = invalidCharsRemoved.Replace(' ', '_');
            invalidCharsRemoved = invalidCharsRemoved.Replace(',', '_'); // To fix publish screen shot error from teamcity 
            return invalidCharsRemoved;
        }

        public static Bitmap CombineImages(List<Bitmap> images)
        {
            int width = 0;
            int height = 0;
            foreach (var image in images)
            {
                height += image.Height;
                if (image.Width > width)
                {
                    width = image.Width;
                }
            }

            Bitmap fullBmp = new Bitmap(width, height);
            using (Graphics g = Graphics.FromImage(fullBmp))
            {
                var currentHeight = 0;
                foreach (var image in images)
                {
                    g.DrawImage(image, new Point(0, currentHeight));
                    currentHeight += image.Height;
                }
            }

            return fullBmp;
        }

        public static void HideComponent(string componentCssSelector, UtfWebDriver driver)
        {
            if (componentCssSelector != null)
            {
                // string jsHideComponent = $"document.querySelector('{componentCssSelector}').setAttribute('style', 'visibility: hidden')";
                string jsHideComponent = $"document.querySelectorAll(\"{componentCssSelector}\").forEach(function(element) {{ element.setAttribute('style', 'visibility: hidden');}});";
                driver.ExecuteJavaScript(jsHideComponent);
            }
        }

        public static bool CheckScreenshot(string screenshotBaseName, string testName, Bitmap screenshot, bool saveOnlyMode, string benchmarksDirectory, string diffsDirectory, int? screenWidth = null, int? screenHeight = null)
        {
            string screenshotName = GetFullScreenshotName(screenshotBaseName, testName, screenWidth, screenHeight);
            if (saveOnlyMode)
            {
                SaveImageWithOverride($"{diffsDirectory}\\{screenshotName}", screenshot);
                return true;
            }
            else
            {
                Bitmap benchmark;
                try
                {
                    benchmark = new Bitmap($"{benchmarksDirectory}\\{screenshotName}");
                }
                catch (Exception e)
                {
                    Logger.WriteLineWithTimestamp($"Failed to get benchmark image. Error: {e.Message}. Stackteace: {e.StackTrace}");
                    throw;
                }

                float similarityLevel = GetSimularityLevel(screenshot);
                if (BitmapAssertion.AreEqual(benchmark, screenshot, similarityLevel))
                {
                    return true;
                }

                // var comparer = new BitmapComparer();
                // var diff = comparer.Compare(benchmark, screenshot);
                try
                {
                    // SaveImageWithOverride($"{diffsDirectory}\\{screenshotName}", diff);
                    SaveImageWithOverride($"{diffsDirectory}\\actual_{screenshotName}", screenshot);
                }
                catch (Exception e)
                {
                    Logger.WriteLineWithTimestamp($"Failed to save diff or actual screenshot. Error: {e.Message}. Stacktrace: {e.StackTrace}");
                }

                return false;
            }
        }

        private static float GetSimularityLevel(Bitmap screenshot)
        {
            var imageSize = screenshot.Size.Height * screenshot.Size.Width;
            var maxSize = MaxHeight * MaxWidth;
            return (float)(1 - (1 - imageSize / maxSize) * 0.001);
        }

        private static string GetFullScreenshotName(string screenshotBaseName, string testName, int? width, int? height)
        {
            return $"{testName}_{screenshotBaseName}_{width ?? 0}x{height ?? 0}";
        }

        private static void SaveImageWithOverride(string fileName, Bitmap image)
        {
            if (File.Exists(fileName))
            {
                File.Delete(fileName);
            }

            image.Save(fileName);
        }
    }
}
