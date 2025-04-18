// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Web;
using System.Xml;
using FluentAssertions;
using Sitecore.Horizon.Integration.Tests.Ui.ApiHelpers.Data;
using Sitecore.Horizon.Integration.Tests.Ui.ApiHelpers.HorizonEntities;
using Sitecore.Horizon.Integration.Tests.Ui.ApiHelpers.HorizonEntities.Item;
using Sitecore.Horizon.Integration.Tests.Ui.ApiHelpers.HorizonEntities.Page;
using Sitecore.Horizon.Integration.Tests.Ui.Wrappers.Components.MediaDialogs.ImagesDialog;
using Sitecore.Horizon.Integration.Tests.Ui.Wrappers.Components.PageLayout.CanvasControls;
using Sitecore.Horizon.Integration.Tests.Ui.Wrappers.Components.RightPanel;
using TechTalk.SpecFlow;
using UTF;
using Constants = Sitecore.Horizon.Integration.Tests.Ui.Wrappers.Data.Constants;
using Context = Sitecore.Horizon.Integration.Editor.Tests.UI.Helpers.Context;

namespace Sitecore.Horizon.Integration.Editor.Tests.UI.Features.FieldsEditing
{
    [Binding]
    public class RichTextFieldSteps
    {
        private static IPageItem singlePageForRteFormattingTests;
        private LinkDetailsPanel _linkDetailsPanel;
        private string _linkPath;
        private string _rteFieldName = "Text";
        private string _singleLineFieldName = "Title";

        private CanvasField RteField => Context.Editor.CurrentPage
            .GetFieldControl(DefaultScData.RenderingDataSourceTextFieldDetails(DefaultScData.SxaRenderings.RichText).Item2, PageFieldType.RichText);

        private CanvasField SingleLineField => Context.Editor.CurrentPage
            .GetFieldControl(DefaultScData.RenderingDataSourceTextFieldDetails(DefaultScData.SxaRenderings.Title).Item2, PageFieldType.SingleLineText);

        [BeforeFeature("RichTextField")]
        public static void CreteTestPageForFormatting()
        {
            var rendering = Context.ApiHelper.Items.GetItem(DefaultScData.RenderingId(DefaultScData.SxaRenderings.RichText));
            singlePageForRteFormattingTests = Context.ApiHelper.Items.CreatePageSxa();
            var dsItem = Context.ApiHelper.Items.AddSxaRenderingDataSourceItemToPage((PageItem)singlePageForRteFormattingTests, DefaultScData.SxaRenderings.RichText, "Text 1");

            singlePageForRteFormattingTests.StandardFields.Layout.AddControl(rendering, "headless-main", dsItem.Id);
            singlePageForRteFormattingTests.DoNotDelete = true;
        }

        [Given(@"User selects other field to invoke autosave")]
        public void GivenUserSelectsOtherFieldToInvokeAutosave()
        {
            SingleLineField.Select();
        }

        [Given(@"text field of Rich Text rendering looses focus")]
        public void GivenTextFieldOfRichTextRenderingLoosesFocus()
        {
            Context.Editor.CurrentPage
                .GetFieldControl(DefaultScData.RenderingDataSourceTextFieldDetails(DefaultScData.SxaRenderings.RichText).Item2, PageFieldType.RichText)
                .LooseFocus();
        }

        [Given(@"RTE field has link with path '(.*)' and text '(.*)' and alt text '(.*)' and target is new tab")]
        public void GivenRTEFieldHasLinkWithTestToChildPage(string path, string text, string altText)
        {
            var fieldValue = $"<p>This text contains link - <a href=\"{path}\" title=\"{altText}\" target=\"_blank\"\">{text}</a> and some more text</p>";
            Context.ApiHelper.Items.EditDataFieldInPage(Context.Page, fieldValue, DefaultScData.SxaRenderings.RichText);
        }

        [Given(@"User clicks to test url")]
        public void GivenUserTestsUrl()
        {
            _linkDetailsPanel.TestUrl();
        }

        [Then(@"Text '(.*)' remains selected in RTE field")]
        public void ThenTextRemainsSelectedInRTEField(string text)
        {
            RteField.GetSelectedText().Should().BeEquivalentTo(text);
        }

        [Then(@"Link details panel has path '(.*)' and alt text '(.*)' and target '(.*)'")]
        public void ThenLinkDetailsPanelHasPathAndAltTextAndTarget(string path, string altText, RteLinkTarget target)
        {
            _linkDetailsPanel.Path.Should().Be(path);
            _linkDetailsPanel.AlternativeText.Should().Be(altText);
            _linkDetailsPanel.Target.Should().Be(target);
        }

        [Given(@"User removes link")]
        public void ThenUserRemovesLink()
        {
            _linkDetailsPanel.RemoveLink();
        }

        [Then(@"RTE field does not contain values '(.*)'")]
        public void ThenRTEFieldDoesnotContainValue(string values)
        {
            var valuesArray = values.Split(',');
            foreach (var value in valuesArray)
            {
                Context.Page.GetFieldValue(_rteFieldName).Should().NotContain(value.Trim());
            }
        }

        [Given(@"Page has value '(.*)' in RTE field")]
        public void GivenPageHasValueInField(string value)
        {
            Context.ApiHelper.Items.EditDataFieldInPage(Context.Page, value, DefaultScData.SxaRenderings.RichText);
        }

        [Given(@"RTE field of test page has '(.*)' raw value")]
        public void GivenPageHasValueInRTEField(string value)
        {
            Context.Page = singlePageForRteFormattingTests;
            Context.ApiHelper.Items.EditDataFieldInPage(Context.Page, value, DefaultScData.SxaRenderings.RichText);
        }

        [Given(@"User selects text '(.*)' in RTE field")]
        public void GivenUserSelectsTextInField(string textToSelect)
        {
            var field = RteField;
            field.Select();
            field.SelectText(textToSelect);
        }

        [Then(@"New Api requests are not sent after text '(.*)' is selected")]
        public void ThenApiRequestsAreNotSentAfterTextIsSelected(string textToSelect)
        {
            RteField.Select();
            var scriptToMeasureNumberOfREquests = "return window.performance.getEntries().filter(r=>r.entryType == 'resource' || r.entryType == 'navigation').length;";
            var numberOfReauestsBeforeActionInRte = Context.Horizon.Browser.ExecuteJavaScript<Int64>(scriptToMeasureNumberOfREquests);
            RteField.SelectText(textToSelect);
            Thread.Sleep(1500);
            var numberOfReauestsAfterActionInRte = Context.Horizon.Browser.ExecuteJavaScript<Int64>(scriptToMeasureNumberOfREquests);
            numberOfReauestsAfterActionInRte.Should().BeLessOrEqualTo(numberOfReauestsBeforeActionInRte + 2);//SXA added an additional api call on edit : sxa/horizon/metadata/gridSection & editRendering
        }

        [Given(@"User opens Link details panel")]
        public void GivenUserOpensLinkDetailsPanel()
        {
            _linkDetailsPanel = Context.Editor.RightPanel.RichTextEditor.OpenLinkDetailsPanel();
        }

        [Given(@"User enters path of child page")]
        public void GivenUserEntersPathToChildPage()
        {
            var url = Context.ChildPage.PageType != LayoutType.SXA
                ? Context.ChildPage.Path.Replace("/sitecore/content", "") + $"?sc_site=website"
                : Context.ChildPage.Path.Replace($"/sitecore/content/SXAHeadlessTenant/{Constants.SXAHeadlessSite}", "") + $"?sc_site={Constants.SXAHeadlessSite}";
            _linkPath = Settings.Instances.Cm + url;
            _linkDetailsPanel.Path = _linkPath;
        }

        [Given(@"user enters value '(.*)' to the path of link")]
        public void GivenUserEntersValueToThePathOfLink(string value)
        {
            _linkDetailsPanel.Path = value;
        }

        [Given(@"User selects target '(.*)'")]
        public void GivenUserSelectSameTab(RteLinkTarget target)
        {
            _linkDetailsPanel.Target = target;
        }

        [Given(@"user enters Alternative text '(.*)'")]
        public void GivenUserEntersAlternativeText(string text)
        {
            _linkDetailsPanel.AlternativeText = text;
        }

        [Given(@"User clicks on '(.*)' link to child page")]
        public void GivenUserClicksOnLinkToChildPage(RteLinkTarget target)
        {
            string linkCssSelector = string.Format("a[href*='{0}']", _linkPath);
            if (target == RteLinkTarget.SameTab)
            {
                Context.Editor.CurrentPage.GetControl(linkCssSelector).CtrlClick();
                Context.Editor.WaitForNewPageInCanvasLoaded();
            }
            else
            {
                Context.Editor.CurrentPage.GetControl(linkCssSelector).CtrlClick();
            }
        }

        [Given(@"User reselects page in tree to ensure work with updated data")]
        public void GivenUserReselectsPaginInTree()
        {
            Context.Editor.ContentTree.RootItem.Select();
            Context.Editor.ContentTree.GetItem(Context.Page).Select();
        }

        [Then(@"Child page is opened in '(.*)' target")]
        public void ThenChildBecameContextPage(RteLinkTarget target)
        {
            if (target == RteLinkTarget.SameTab)
            {
                SingleLineField.Text.Should().Be(Context.ChildPage.Name);
                Context.Editor.ContentTree.SelectedItem.Name.Should().BeEquivalentTo(Context.ChildPage.Name);
            }
            else
            {
                try
                {
                    Context.Horizon.Browser.SwitchToWindow(_linkPath);
                    var text = Context.Horizon.Browser.PageText;
                    text.Should().Contain(Context.ChildPage.Name);
                    Context.Horizon.Browser.CloseCurrentWindow();
                }
                catch (Exception e)
                {
                    Logger.WriteLineWithTimestamp(e.Message + e.StackTrace);
                    throw;
                }
                finally
                {
                    Context.Horizon.Browser.SwitchToWindow(Context.Page.ShortId.ToLower());
                }
            }
        }

        [Given(@"User applies (.*) formatting")]
        public void GivenUserApplies(RteFormatting formatting)
        {
            bool waitForAutoSave = formatting != RteFormatting.AllignLeft && formatting != RteFormatting.Normal;
            Context.Editor.RightPanel.RichTextEditor.ApplyFormatting(formatting, waitForAutoSave);
        }

        [Given(@"User applies indent '(.*)' formatting '(.*)' times")]
        public void GivenUserAppliesIndentFormattingTimes(RteFormatting formatting, int count)
        {
            for (int i = 0; i < count; i++)
            {
                Context.Editor.RightPanel.RichTextEditor.ApplyFormatting(formatting);
            }
        }

        [Given(@"User removes formatting")]
        public void GivenUserRemovesFormatting()
        {
            Context.Editor.RightPanel.RichTextEditor.RemoveFormatting();
        }

        [Given(@"RTE field of test page has '(.*)' value formatted as '(.*)' and has custom class attribute '(.*)' value")]
        public void GivenRTEFieldOfTestPageHasValueFormattedAsBold(string text, RteFormatting formatting, string customClassAttributeValue)
        {
            XmlDocument formattedTextNode = new XmlDocument();
            XmlElement xmlElement = null;
            XmlElement temXmlElement = null;

            // Create html formatted value
            var tags = GetHtmlXPathBasedOnFormatting(formatting).Split('/');
            foreach (var tag in tags)
            {
                if (!string.IsNullOrEmpty(tag))
                {
                    var el = formattedTextNode.CreateElement(tag);

                    if (xmlElement == null)
                    {
                        xmlElement = el;
                    }
                    else
                    {
                        temXmlElement.AppendChild(el);
                    }

                    temXmlElement = el;
                }
            }

            temXmlElement.InnerText = text;
            if (!string.IsNullOrEmpty(customClassAttributeValue))
            {
                temXmlElement.SetAttribute("class", customClassAttributeValue);
            }

            formattedTextNode.AppendChild(xmlElement);

            Context.Page = singlePageForRteFormattingTests;
            Context.ApiHelper.Items.EditDataFieldInPage(Context.Page, formattedTextNode.InnerXml, DefaultScData.SxaRenderings.RichText);
        }

        [Then(@"Formatting (.*) is applied on '(.*)' text with adding '(.*)' class")]
        public void ThenFormattingNormalIsAppliedOnTextWithAddingClass(RteFormatting formatting, string text, string className)
        {
            ThenFormattingNormalIsAppliedOnText(formatting, text);
            var formattedElements = GetElementsWithSpecificFormatting(formatting);
            formattedElements.Should().Contain(e => e.GetClass().Contains(className));
        }

        [Then(@"Formatting (.*) is applied on '(.*)' text")]
        public void ThenFormattingNormalIsAppliedOnText(RteFormatting formatting, string text)
        {
            //Check value in Canvas
            var formattedElements = GetElementsWithSpecificFormatting(formatting);
            formattedElements.Count(e => e.Text == text).Should().Be(1);

            //Check that value got saved
            CheckRteFieldValueIsSaved(RteField.InnerHTML, _rteFieldName);

            //UI control is highlighted
            Context.Editor.RightPanel.RichTextEditor.IsFormattingApplied(formatting).Should().BeTrue($"Formatting {formatting} is not selected on RTE control");
        }

        [Then(@"RTE field of test page should have '(.*)' raw value")]
        public void ThenRTEFieldOfTestPageShouldHaveRawValue(string rawValue)
        {
            RteField.InnerHTML.Should().BeEquivalentTo(rawValue);
            CheckRteFieldValueIsSaved(rawValue, _rteFieldName);
        }

        [Then(@"UI of RTE shows that formatting '(.*)' is not applied")]
        public void ThenUIOfRTEShowsThatFormattingIsNotApplied(RteFormatting formatting)
        {
            bool shouldBeShownAsAppliedInUI = formatting == RteFormatting.Normal || formatting == RteFormatting.AllignLeft || formatting == RteFormatting.DecreaseIndent;
            Context.Editor.RightPanel.RichTextEditor.IsFormattingApplied(formatting).Should().Be(shouldBeShownAsAppliedInUI,
                $"Formatting {formatting} should not be selected on RTE control");
        }

        [Given(@"User puts caret '(.*)' text '(.*)' in RTE field")]
        public void GivenUserPutsCaretTextInRTEField(string position, string text)
        {
            var caretPosition = position == "before";
            RteField.PutCaret(text, caretPosition);
        }

        [Given(@"user press '(.*)' button in RTE field")]
        public void GivenUserPressButtonInRTEField(string button)
        {
            switch (button)
            {
                case "backspace":
                    RteField.PressBackSpaceButton();
                    break;
                case "enter":
                    RteField.PressEnterButton();
                    break;
                case "delete":
                    RteField.PressDeleteButton();
                    break;
                default:
                    throw new Exception($"{button} is not supported by the method");
            }
        }

        [Then(@"Image '(.*)' is added between '(.*)' text and '(.*)' text in RTE field")]
        public void ThenImageIsAddedInRteField(string imagePath, string textBefore, string textAfter)
        {
            var imageItem = Context.ApiHelper.Items.GetItem(imagePath);
            var savedFieldValue = Context.ApiHelper.Items.GetFieldInSxaComponent(Context.Page, DefaultScData.SxaRenderings.RichText, _rteFieldName);
            var imageIdNormalized = imageItem.ShortId.Replace("-", "");
            savedFieldValue.Should().ContainEquivalentOf(imageIdNormalized);
            savedFieldValue.IndexOf("img").Should().BeLessThan(savedFieldValue.IndexOf(textAfter));
            savedFieldValue.IndexOf("img").Should().BeGreaterThan(savedFieldValue.IndexOf(textBefore));
            var imageWebElement = RteField.GetElements("img").FirstOrDefault();
            imageWebElement.Should().NotBeNull();
            imageWebElement.GetAttribute("src").Should().ContainEquivalentOf(imageIdNormalized);
        }

        [Then(@"RTE field is selected upon clicking image or text '(.*)'")]
        public void ThenRteFieldIsSelectedUponClickingTheImage(string text)
        {
            /*
             * Bug420448
             * Click on a field other than RTE field
             * Click on image in the RTE
             * RTE field should be selected
             */

            SingleLineField.Select();
            RteField.GetElements("img").FirstOrDefault().Click();
            Context.Horizon.Browser.WaitForHorizonIsStable();
            Context.Editor.CurrentPage.GetSelectedFrame().ChipTitle.Should().Be(_rteFieldName);
            _ = Context.Editor.RightPanel.RichTextEditor;

            SingleLineField.Select();
            Context.Editor.CurrentPage.GetSelectedFrame().ChipTitle.Should().Be(_singleLineFieldName);

            RteField.PutCaret(text, true);
            Context.Editor.CurrentPage.GetSelectedFrame().ChipTitle.Should().Be(_rteFieldName);
            _ = Context.Editor.RightPanel.RichTextEditor;
        }

        [Then(@"rte field doesn't contain image")]
        public void ThenRteFieldDoesntContainImage()
        {
            this.WaitForCondition(c => !Context.Page.GetFieldValue(_rteFieldName).Contains("img"), 5000);
            Context.Page.GetFieldValue(_rteFieldName).Should().NotContain("img");
            Context.Page.GetFieldValue(_rteFieldName).Should().NotContain("src");
            RteField.GetElements("img").Should().BeEmpty();
        }

        [Then(@"rte field has '(.*)' link")]
        public void ThenRteFieldHasLink(int numberOfLinks)
        {
            RteField.GetElements("a").Count.Should().Be(numberOfLinks);
        }

        [Then(@"rte field has link with '(.*)' path and '(.*)' target and '(.*)' alternative text")]
        public void ThenRteFieldHasLinkWithPathAndTargetAndAlternativeText(string linkPath, RteLinkTarget target, string altText)
        {
            var links = RteField.GetElements("a").Where(l =>
                l.GetAttribute("href").Contains(linkPath)
                && l.GetAttribute("title") == altText
                && (target == RteLinkTarget.NewTab ? l.GetAttribute("target") == "_blank" : l.GetAttribute("target") == "")
            );
            links.Count().Should().Be(1);
            var link = links.First();

            //var link = RteField.GetElements("a").First();
            //link.GetAttribute("href").Should().Be(linkPath);
            //link.GetAttribute("title").Should().Be(altText);
            if (target == RteLinkTarget.NewTab)
            {
                link.GetAttribute("target").Should().Be("_blank");
            }
            else
            {
                link.GetAttribute("target").Should().BeEmpty();
            }
        }

        [Then(@"rte field has link with path to child page and '(.*)' target and '(.*)' alternative text")]
        public void ThenRteFieldHasLinkWithPathToChildPageAndTargetAndAlternativeText(RteLinkTarget target, string altText)
        {
            //_linkPath = Settings.Instances.Cm + Context.ChildPage.Path.Replace("/sitecore/content", "");
            ThenRteFieldHasLinkWithPathAndTargetAndAlternativeText(_linkPath, target, altText);
        }

        [Given(@"User closes link details panel")]
        public void GivenUserClosesLinkDetailsPanel()
        {
            _linkDetailsPanel.ClosePanel();
        }

        [Given(@"User enters text '(.*)' in RTE field")]
        [When(@"User enters text '(.*)' in RTE field")]
        public void GivenUserEntersTextInRteField(string text)
        {
            RteField.Click();
            RteField.SetText(text);
        }

        [Then(@"Value of RTE field '(.*)' is saved to '(.*)'")]
        public void ThenValueOfRteFieldIsSavedTo(string fieldName, string value)
        {
            CheckRteFieldValueIsSaved(value, fieldName);

            // Replace line breaks as platform and quill use different tags for line break
            RteField.InnerHTML.Should().BeEquivalentTo(value.Replace("<br />", "<br>"));
        }

        [Then(@"RTE field '(.*)' is clear")]
        public void ThenRteFieldIsClear(string fieldName)
        {
            CheckRteFieldValueIsSaved("", fieldName);
            RteField.InnerHTML.Should().BeEquivalentTo("<p><br></p>");
        }

        [Then(@"Value of RTE field in canvas is an encoded equivalent of ""([^""]*)""")]
        public void ThenValueOfRTEFieldInCanvasIsAnEncodedEquivalentOf(string expectedValue)
        {
            HttpUtility.HtmlDecode(RteField.InnerHTML).Should().BeEquivalentTo("<p>" + expectedValue + "</p>");
        }

        private void CheckRteFieldValueIsSaved(string expectedValue, string rteFieldName)
        {
            bool valueIsSaved = false;
            var actualValue = "";
            this.WaitForCondition(c =>
            {
                actualValue = Context.ApiHelper.Items.GetFieldInSxaComponent(Context.Page, DefaultScData.SxaRenderings.RichText, rteFieldName);
                valueIsSaved = actualValue == expectedValue;
                return valueIsSaved;
            }, 4000, message: $"Actual field value is {actualValue}, expected is {expectedValue}");

            valueIsSaved.Should().BeTrue($"Value {expectedValue} is not saved");
        }

        private List<WebElement> GetElementsWithSpecificFormatting(RteFormatting formatting)
        {
            string cssSelector = "";
            switch (formatting)
            {
                case RteFormatting.Bold:
                    cssSelector = "strong";
                    break;
                case RteFormatting.Italic:
                    cssSelector = "em";
                    break;
                case RteFormatting.Underline:
                    cssSelector = "u";
                    break;
                case RteFormatting.Strikethrough:
                    cssSelector = "s";
                    break;
                case RteFormatting.Normal:
                    cssSelector = "p";
                    break;
                case RteFormatting.Header1:
                    cssSelector = "h1";
                    break;
                case RteFormatting.Header2:
                    cssSelector = "h2";
                    break;
                case RteFormatting.Header3:
                    cssSelector = "h3";
                    break;
                case RteFormatting.Header4:
                    cssSelector = "h4";
                    break;
                case RteFormatting.Header5:
                    cssSelector = "h5";
                    break;
                case RteFormatting.Header6:
                    cssSelector = "h6";
                    break;
                case RteFormatting.NumberedList:
                    cssSelector = "ol li";
                    break;
                case RteFormatting.BulletList:
                    cssSelector = "ul li";
                    break;
                case RteFormatting.AllignRight:
                    cssSelector = ".rte-align-right";
                    break;
                case RteFormatting.AllignLeft:
                    cssSelector = "p";
                    break;
                case RteFormatting.AllignCenter:
                    cssSelector = ".rte-align-center";
                    break;
                case RteFormatting.Justify:
                    cssSelector = ".rte-align-justify";
                    break;
                case RteFormatting.IncreaseIndent:
                    cssSelector = "[class*=rte-indent]";
                    break;
                case RteFormatting.DecreaseIndent:
                    cssSelector = "p, [class*=rte-indent]";
                    break;
            }

            return RteField.GetElements(cssSelector);
        }

        private string GetHtmlXPathBasedOnFormatting(RteFormatting formatting)
        {
            string xpath = "";
            switch (formatting)
            {
                case RteFormatting.Bold:
                    xpath = "/p/strong";
                    break;
                case RteFormatting.Italic:
                    xpath = "/p/em";
                    break;
                case RteFormatting.Underline:
                    xpath = "/p/u";
                    break;
                case RteFormatting.Strikethrough:
                    xpath = "/p/s";
                    break;
                case RteFormatting.Normal:
                    xpath = "/p";
                    break;
                case RteFormatting.Header1:
                    xpath = "/h1";
                    break;
                case RteFormatting.Header2:
                    xpath = "/h2";
                    break;
                case RteFormatting.Header3:
                    xpath = "/h3";
                    break;
                case RteFormatting.Header4:
                    xpath = "/h4";
                    break;
                case RteFormatting.Header5:
                    xpath = "/h5";
                    break;
                case RteFormatting.Header6:
                    xpath = "/h6";
                    break;
                case RteFormatting.NumberedList:
                    xpath = "/ol/li";
                    break;
                case RteFormatting.BulletList:
                    xpath = "/ul/li";
                    break;
                case RteFormatting.AllignRight:
                case RteFormatting.AllignLeft:
                case RteFormatting.AllignCenter:
                case RteFormatting.Justify:
                case RteFormatting.IncreaseIndent:
                case RteFormatting.DecreaseIndent:
                    xpath = "/p";
                    break;
            }

            return xpath;
        }
        
        //Bring back deleted step definitions from deleted classes,

        private IGenericItem image = null;
        private ImagesDialog dialog = null;

        [Given(@"Media library has '(.*)' image under '(.*)' path")]
        public void GivenMediaLibraryHasImageUnderPath(string imageName, string imageParentPath)
        {
            image = Context.ApiHelper.Items.MediaLibraryHelper.CreateUnversionedImage(imageName, imageParentPath, "some alt text :)");
        }

        [Given(@"user invokes image dialog from RTE")]
        public void GivenUserInvokeImageDialogFromRTE()
        {
            dialog = Context.Editor.RightPanel.RichTextEditor.OpenMediaDialog();
        }

        [Given(@"User selects '(.*)' image in '(.*)' path in image dialog")]
        [When(@"User selects '(.*)' image in '(.*)' path in image dialog")]
        public void WhenUserSelectsImageInPathInImageDialog(string imageName, string mediaFolderName)
        {
            WaitForSearchToIndexSpecificImageInMediaFolder(imageName, mediaFolderName);
            dialog.SelectImage(imageName);
        }

        [When(@"User press add selected button in media library")]
        public void WhenUserPressAddSelectedButtonInMediaLibrary()
        {
            dialog.AddSelected();
        }

        [Given(@"User undo changes")]
        [When(@"User undo changes")]
        [Given(@"User clicks Undo")]
        [When(@"User clicks Undo")]
        public void GivenUserUndoChanges()
        {
            Context.Editor.TopPanel.Undo();
        }

        [Given(@"User redo changes")]
        [When(@"User clicks Redo")]
        public void GivenUserRedoChanges()
        {
            Context.Editor.TopPanel.Redo();
        }

        [Then(@"Undo control is not active")]
        public void ThenUndoControlIsNotActive()
        {
            Context.Editor.TopPanel.UndoEnabled.Should().BeFalse();
        }

        [Then(@"Redo control is not active")]
        public void ThenRedoControlIsNotActive()
        {
            Context.Editor.TopPanel.RedoEnabled.Should().BeFalse();
        }

        [When(@"user reloads this page")]
        public void WhenUserReloadsThisPage()
        {
            Context.Horizon.Browser.Refresh();
            Context.Editor.WaitForNewPageInCanvasLoaded();
        }

        private void WaitForSearchToIndexSpecificImageInMediaFolder(string requiredImageName, string mediaFolderPath, string language = "en")
        {
            WaitForSearchToIndexImagesInMediaFolder(1, requiredImageName, mediaFolderPath, language);
        }

        private void WaitForSearchToIndexImagesInMediaFolder(int expectedMinNumberOfImages, string requiredImageName,
            string mediaFolderPath, string language = "en", string searchPhrase = null)
        {
            //need wait here since search takes some time to index newly created images
            this.WaitForCondition(c =>
            {
                if (!string.IsNullOrEmpty(mediaFolderPath))
                {
                    var mediaFolderItem = Context.ApiHelper.Items.GetItem(mediaFolderPath);
                    dialog.ImagesTree.GetItem(mediaFolderItem, language).Select();
                }

                if (!string.IsNullOrEmpty(searchPhrase))
                {
                    dialog.SetSearchPhrase(searchPhrase);
                }

                //dialog.WaitForAnyImages();
                bool imageIsPresent = true;
                if (!string.IsNullOrEmpty(requiredImageName))
                {
                    imageIsPresent = dialog.GetImages().Contains(requiredImageName);
                }

                bool totalNumberIsCorrect = dialog.GetImages().Count >= expectedMinNumberOfImages;
                bool imagesHasBeenIndexed = imageIsPresent && totalNumberIsCorrect;
                if (!imagesHasBeenIndexed)
                {
                    dialog.Close();
                    dialog = Context.Editor.RightPanel.IsImageFieldSelectionExpanded ? Context.Editor.RightPanel.ImageFieldSection.InvokeImageDialog() : Context.Editor.RightPanel.RichTextEditor.OpenMediaDialog();
                }

                return imagesHasBeenIndexed;
            }, 30000, 1000);
        }
    }
}
