// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using NUnit.Framework;
using NUnit.Framework.Interfaces;
using Sitecore.Horizon.ContentHub.Dam.Plugin.Tests.UI.Helpers;
using Sitecore.Horizon.Integration.Tests.Ui.ApiHelpers.Data;
using Sitecore.Horizon.Integration.Tests.Ui.Wrappers.Components.MediaDialogs.ImagesDialog;
using Sitecore.Horizon.Integration.Tests.Ui.Wrappers.Services;
using UTF;
using Context = Sitecore.Horizon.ContentHub.Dam.Plugin.Tests.UI.Helpers.Context;

namespace Sitecore.Horizon.ContentHub.Dam.Plugin.Tests.UI
{
    public class TestsBase
    {
        [SetUp]
        public void BaseSetUp()
        {
            Logger.WriteLineWithTimestamp($"--- Test '{TestContext.CurrentContext.Test.Name}' has started ---");
        }

        [TearDown]
        public void BaseTearDown()
        {
            ReportErrorsIfAny();
            TestData.ClearItems();
            TestData.ClearFiles();
            Logger.WriteLineWithTimestamp($"--- Test '{TestContext.CurrentContext.Test.Name}' has finished ---");
        }

        private static void ReportErrorsIfAny()
        {
            if (TestContext.CurrentContext.Result.Outcome.Status != TestStatus.Failed)
            {
                return;
            }

            if (Settings.MakeScreenshotOnFailure)
            {
                string testName = TestContext.CurrentContext.Test.Name;
                string allowedTestName = ScreenshotsHelper.GetValidScreenShotImageName(testName);
                Logger.WriteLineWithTimestamp("URL is " + Context.Horizon.Browser.PageUrl);
                Context.Horizon.Browser.TakeScreenshot(allowedTestName);
            }

            //TODO add checking for console errors 
        }

        protected ImagesDialog WaitForSearchToIndexImagesInMediaFolder(ImagesDialog dialog, string requiredImageName)
        {
            //need wait here since search takes some time to index newly created images
            this.WaitForCondition(c =>
            {
                var imageIsPresent = dialog.GetImages().Contains(requiredImageName);
                if (!imageIsPresent)
                {
                    dialog.Close();
                    dialog = Context.Editor.RightPanel.IsImageFieldSelectionExpanded 
                        ? Context.Editor.RightPanel.ImageFieldSection.InvokeImageDialog() 
                        : Context.Editor.RightPanel.RichTextEditor.OpenMediaDialog();
                    dialog.SwitchToMediaLibraryProvider();
                }

                return imageIsPresent;
            }, 30000, 1000);
            return dialog;
        }
    }
}
