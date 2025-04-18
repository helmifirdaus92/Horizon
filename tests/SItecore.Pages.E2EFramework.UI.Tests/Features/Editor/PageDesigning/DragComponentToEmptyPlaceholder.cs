// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using System.Linq;
using NUnit.Framework;
using Sitecore.E2E.Test.Framework;
using Sitecore.Pages.E2EFramework.UI.Tests.ApiHelpers.PlatformGraphQL;
using Sitecore.Pages.E2EFramework.UI.Tests.Helpers;
using Constants = Sitecore.Pages.E2EFramework.UI.Tests.Helpers.Constants;

namespace Sitecore.Pages.E2EFramework.UI.Tests.Features.Editor.PageDesigning
{
    public class DragComponentToEmptyPlaceholder : BaseFixture
    {
        [Test]
        public void DragComponentToEmptyPlaceholderTest()
        {
            //create page
            var testPage = Preconditions.CreatePage();

            //open Pages &  navigate to created page
            Context.Pages.Editor.Open(testPage.itemId, site: Constants.SXAHeadlessSite);

            //get placeholder to drop the component
            var placeholder = Context.Pages.Editor.CurrentPage.EmptyPlaceholders[0].DropLocation;

            //open Components
            var componentsGallery = Context.Pages.Editor.LeftHandPanel.OpenComponentsTab();
            var component = componentsGallery.GetPageContentComponent("Title");

            //drag and drop component to empty placeholder
            component.DragToPoint(placeholder);

            Context.Pages.Editor.WaitForNewPageInCanvasLoaded();

            //Go to Pages tree to make iframe.editor empty
            Context.Pages.TopBar.AppNavigation.OpenEditor();

            Context.Pages.WaitForCondition(p => p.Editor.CurrentPage.TextInputs.Count > 0);
            Context.Pages.Editor.CurrentPage.TextInputs.First().Text = "new edited page title";
            Context.Pages.Editor.CurrentPage.Click();
        }
    }
}
