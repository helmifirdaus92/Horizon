// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using System.Linq;
using FluentAssertions;
using NUnit.Framework;
using Sitecore.Horizon.ContentHub.Dam.Plugin.Tests.UI.Helpers;
using Sitecore.Horizon.Integration.Tests.Ui.ApiHelpers.HorizonEntities;
using Sitecore.Horizon.Integration.Tests.Ui.ApiHelpers.HorizonEntities.Page;
using Sitecore.Horizon.Integration.Tests.Ui.Wrappers;
using Sitecore.Horizon.Integration.Tests.Ui.Wrappers.Components.ContentHub;
using Sitecore.Horizon.Integration.Tests.Ui.Wrappers.Components.MediaDialogs.ImagesDialog;
using Sitecore.Horizon.Integration.Tests.Ui.Wrappers.Components.PageLayout.CanvasControls;
using Sitecore.Horizon.Integration.Tests.Ui.Wrappers.Components.RightPanel;

namespace Sitecore.Horizon.ContentHub.Dam.Plugin.Tests.UI.TestFeatures
{
    public class RichTextEditorField : TestsBase
    {
        private ImagesDialog _dialog = null;
        private ContentHubMediaProvider _contentHubMediaProvider = null;
        private string _rteFieldName = "Text";
        private IPageItem _page;
        private CanvasField RteField => Context.Editor.CurrentPage.GetFieldControl(_page.Template.GetTemplateField(_rteFieldName).Id, PageFieldType.RichText);

        [Test]
        public void AddImageFromDamToRte()
        {
            //Arrange
            _page = Context.ApiHelper.Items.CreatePage();
            _page.Edit(_rteFieldName, "One Two Three");
            Context.Editor.Open(_page, site: "website");
            RteField.PutCaret("Two", true);

            //Act & Assert
            AddMediaViaContentHub("image1.jpg");
            CheckMediaIsInsertedBetweenText("One", "Two");

            RteField.PutCaret("Two", true);
            RteField.PressBackSpaceButton();
            RteField.LooseFocus();
            CheckRteDoNotContainImage();

            Context.Editor.TopPanel.Undo();
            CheckMediaIsInsertedBetweenText("One", "Two");

            RteField.Select();
            RteField.SelectText("One Two");
            RteField.PressDeleteButton();
            RteField.LooseFocus();
            CheckRteDoNotContainImage();
        }

        private void AddMediaViaContentHub(string mediaName)
        {
            _dialog = Context.Editor.RightPanel.RichTextEditor.OpenMediaDialog();
            _contentHubMediaProvider = _dialog.SwitchToContentHubProvider();
            _contentHubMediaProvider.SelectImage(mediaName);
            _contentHubMediaProvider.ChooseFileToInsert(_dialog);
            _dialog.AddSelected();
            Context.Horizon.Browser.WaitForHorizonIsStable();
        }

        private void CheckRteDoNotContainImage()
        {
            this.WaitForCondition(c => !_page.GetFieldValue(_rteFieldName).Contains("img"), 5000);
            _page.GetFieldValue(_rteFieldName).Should().NotContain("img");
            _page.GetFieldValue(_rteFieldName).Should().NotContain("src");
            RteField.GetElements("img").Should().BeEmpty();
        }

        private void CheckMediaIsInsertedBetweenText(string textBefore, string textAfter)
        {
            this.WaitForCondition(c => _page.GetFieldValue(_rteFieldName).Contains(_contentHubMediaProvider.SelectedMediaUrl), 3000);
            var savedFieldValue = _page.GetFieldValue(_rteFieldName);
            savedFieldValue.Should().Contain(_contentHubMediaProvider.SelectedMediaUrl);
            savedFieldValue.IndexOf("img").Should().BeLessThan(savedFieldValue.IndexOf(textAfter));
            savedFieldValue.IndexOf("img").Should().BeGreaterThan(savedFieldValue.IndexOf(textBefore));
            var imageWebElement = RteField.GetElements("img").FirstOrDefault();
            imageWebElement.Should().NotBeNull();
            imageWebElement.GetAttribute("src").Should().Contain(_contentHubMediaProvider.SelectedMediaUrl);
        }

        private CanvasField GetRteField(IPageItem page)
        {
            return Context.Editor.CurrentPage.GetFieldControl(page.Template.GetTemplateField(_rteFieldName).Id, PageFieldType.RichText);
        }
    }
}
