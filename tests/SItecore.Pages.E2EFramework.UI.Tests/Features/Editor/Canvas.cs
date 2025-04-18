// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using FluentAssertions;
using FluentAssertions.Execution;
using NUnit.Framework;
using Sitecore.Pages.E2EFramework.UI.Tests.ApiHelpers;
using Sitecore.Pages.E2EFramework.UI.Tests.Helpers;
using Sitecore.Pages.E2EFramework.UI.Tests.Helpers.Data;
using Sitecore.Pages.E2EFramework.UI.Tests.Wrappers.Components.PageLayout;

namespace Sitecore.Pages.E2EFramework.UI.Tests.Features.Editor
{
    public class Canvas : BaseFixture
    {
        private IItem _testPage;

        private static Rendering CustomRendering => Context.Pages.Editor.CurrentPage.GetRenderingByName("Custom Component");

        private static Dictionary<string, FieldData> FieldTypes => new Dictionary<string, FieldData>
        {
            { "Datetime", new FieldData(CustomRendering.DateTimeField, "Datetime") },
            { "Number", new FieldData(CustomRendering.NumberField, "Number") },
            { "Integer", new FieldData(CustomRendering.IntegerField, "Integer") },
            { "SingleLineText", new FieldData(CustomRendering.SingleLineTextField, "SingleLineText") },
            { "MultiLineText", new FieldData(CustomRendering.MultiLineTextField, "MultiLineText") },
            { "RichText", new FieldData(CustomRendering.RichTextField, "RichText") },
            { "Image", new FieldData(CustomRendering.ImageField, "Image") },
            { "Date", new FieldData(CustomRendering.DateField, "Date") },
            { "GeneralLink", new FieldData(CustomRendering.GeneralLink, "GeneralLink") }
        };

        [OneTimeSetUp]
        public void StartTestsInEditorTestSite()
        {
            if (!Context.Pages.TopBar.AppNavigation.EditorTabIsActive)
            {
                Context.Pages.TopBar.AppNavigation.OpenEditor();
                Context.Pages.Editor.WaitForNewPageInCanvasLoaded();
            }
            Preconditions.OpenSXAHeadlessSite();
            CreatePageAndAddTestComponent();
        }

        [Test]
        public void UserHoversAllFieldTypes_TheyAreHighlightedAndHaveTags()
        {
            //need to reload canvas before highlight test to clear selection frame after select
            Context.Pages.Editor.ReloadCanvas();

            using (new AssertionScope())
            {
                foreach (var fieldType  in FieldTypes.Values)
                {
                    fieldType.Field.Hover();

                    fieldType.Field.IsValidFrameRectangle(Context.Pages.Editor.CurrentPage.GetHoveredFrame().Rectangle).Should().BeTrue();
                    Context.Pages.Editor.CurrentPage.GetHoveredFrame().HighlightedChipText.Should().Be(fieldType.FieldName);
                }
            }
        }

        [Test]
        public void UserSelectsAllFieldTypes_TheyHaveChipsWithTitlesAndHighlighted()
        {
            using (new AssertionScope())
            {
                foreach (var fieldType in FieldTypes.Values)
                {

                    fieldType.Field.Select();

                    // check that selection frame is visible for all field types
                    Context.Pages.Editor.CurrentPage.SelectionFrame.IsVisible.Should().BeTrue($"Selection frame for '{fieldType.FieldName}' is not visible.");

                    // RTE field doesn't have chip title
                    if (!fieldType.FieldName.Equals("RichText"))
                    {
                        Context.Pages.Editor.CurrentPage.SelectionFrame.ChipElement.Name.Should().Be(fieldType.FieldName, $"Chip element name for '{fieldType.FieldName}' is incorrect.");
                    }

                    // Width of SingleLineText and MultiLineText fields are different (5 px)
                    if (fieldType.FieldName.Contains("LineText"))
                    {
                        continue;
                    }

                    fieldType.Field.IsValidFrameRectangle(Context.Pages.Editor.CurrentPage.SelectionFrame.FrameRectangle).Should().BeTrue($"Field '{fieldType.FieldName}' is not highlighted or highlight border is not in place");
                }
            }
        }

        [Test]
        public void UserHoversRendering_ItIsHighlighted()
        {
            CanvasControl control = Context.Pages.Editor.CurrentPage.GetControl("Custom Component");

            control.Select();
            control.IsFrameRectangleEquivalentTo(Context.Pages.Editor.CurrentPage.SelectionFrame.FrameRectangle)
                .Should().BeTrue($"Canvas control '{control.Name}' is not highlighted or highlight border is not in place");
        }

        [Test]
        public void UserClicksFields_TheyAreDimmed()
        {
            using (new AssertionScope())
            {
                foreach (var fieldType in FieldTypes.Values)
                {
                    if (fieldType.FieldName == "SingleLineText" || fieldType.FieldName == "MultiLineText")
                    {
                        fieldType.Field.Click();
                        fieldType.Field.IsFieldDimmed.Should().BeTrue($"Placeholder text for '{fieldType.FieldName}' should be dimmed.");
                    }
                }
            }
        }

        [Test]
        public void Chrome_Re_discovery_verification()
        {
            CustomRendering.NumberField.Select();

            Context.Pages.Editor.CurrentPage.ExecuteJavaScript(@"
                let numberField = document.querySelector('.Number>span').parentElement;
                let content = numberField.innerHTML;
                numberField.innerHTML = '';
                numberField.innerHTML = content");

            Context.Pages.Editor.CurrentPage.ExecuteJavaScript("window['Sitecore.Horizon.ResetChromes']()");

            CustomRendering.NumberField.IsValidFrameRectangle(Context.Pages.Editor.CurrentPage.SelectionFrame.FrameRectangle).Should().BeTrue($"Field 'Number' is not highlighted or highlight border is not in place");
            UpdateNumberFieldValue("123");

            CustomRendering.ImageField.Select();
            Context.Pages.Editor.RightHandPanel.ImageElementOptions.IsAddButtonEnabled().Should().BeTrue();

            CustomRendering.NumberField.Text.Should().Be("123");

            CanvasControl control = Context.Pages.Editor.CurrentPage.GetControl("Custom Component");

            control.Select();
            control.IsFrameRectangleEquivalentTo(Context.Pages.Editor.CurrentPage.SelectionFrame.FrameRectangle)
                .Should().BeTrue($"Canvas control '{control.Name}' is not highlighted or highlight border is not in place");

            CustomRendering.NumberField.Select();
            CustomRendering.NumberField.IsValidFrameRectangle(Context.Pages.Editor.CurrentPage.SelectionFrame.FrameRectangle).Should().BeTrue($"Field 'Number' is not highlighted or highlight border is not in place");
        }

        private static void UpdateNumberFieldValue(string value)
        {
            CustomRendering.NumberField.Click();
            Context.Pages.Editor.RightHandPanel.NumericalInput.Click();
            Context.Pages.Editor.RightHandPanel.NumericalInput.Clear();
            if (value.Equals(string.Empty))
            {
                //Only Selenium send keys is not triggering a save action, hence the workaround.
                Context.Pages.Editor.RightHandPanel.NumericalInput.SendKeys(" ");
                Context.Pages.Editor.RightHandPanel.NumericalInput.Clear();
            }

            Context.Pages.Editor.RightHandPanel.NumericalInput.SendKeys(value);
        }

        private void CreatePageAndAddTestComponent()
        {
            //Create page
            // this page will be used for all tests in this feature
            _testPage = Preconditions.CreatePage(doNotDelete:true);
            Preconditions.OpenEnglishLanguage();

            // add custom component
            Preconditions.AddComponent(_testPage.itemId, _testPage.path, DefaultScData.RenderingId(DefaultScData.SxaRenderings.CustomComponent));

            // open page
            Context.Pages.Editor.LeftHandPanel.OpenSiteTree();
            Context.Pages.Editor.LeftHandPanel.SiteContentTree.RefreshTreeAtRootItem();
            Context.Pages.Editor.LeftHandPanel.SiteContentTree.GetItemByPath(_testPage.name).Select();
        }

        internal class FieldData
        {
            public CanvasField Field { get; }
            public string FieldName { get; }

            public FieldData(CanvasField field, string fieldName)
            {
                Field = field;
                FieldName = fieldName;
            }
        }

    }
}
