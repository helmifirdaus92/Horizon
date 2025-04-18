// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using FluentAssertions;
using NUnit.Framework;
using Sitecore.E2E.Test.Framework;
using Sitecore.Pages.E2EFramework.UI.Tests.ApiHelpers.PlatformGraphQL.Types;
using Sitecore.Pages.E2EFramework.UI.Tests.Helpers;
using Sitecore.Pages.E2EFramework.UI.Tests.Helpers.Data;
using Sitecore.Pages.E2EFramework.UI.Tests.Wrappers;
using Sitecore.Pages.E2EFramework.UI.Tests.Wrappers.Controls;
using Sitecore.Pages.E2EFramework.UI.Tests.Wrappers.Controls.Dialog;

namespace Sitecore.Pages.E2EFramework.UI.Tests.Features.Editor.FieldsEditing;

public class ImagesDialogSearch : BaseFixture
{
    private string _mediaLibraryPath = $"/sitecore/media library/Project/{Context.SXAHeadlessTenant}/{Constants.SXAHeadlessSite}";
    private Item _testPage;
    private Item _mediaFolder;
    private Item _image1;
    private Item _image2;
    private Item _image3;
    private Item _image;

    [OneTimeSetUp]
    public void OpenSXASite_CreateTestData()
    {
        Preconditions.OpenSXAHeadlessSite();
        Context.Pages.TopBar.AppNavigation.OpenEditor();
        Context.Pages.Editor.LeftHandPanel.OpenSiteTree();

        _testPage = Preconditions.CreatePage(doNotDelete: true);

        _mediaFolder = Preconditions.CreateFolder("ImagesFolder", parentId: Context.ApiHelper.PlatformGraphQlClient.GetItem(_mediaLibraryPath).itemId, doNotDelete: true);
        _image1 = Preconditions.UploadImage("FirstImageName1", "jpg", _mediaFolder, "image1 alt", doNotDelete: true);
        _image2 = Preconditions.UploadImage("SecondImageName2", "jpg", _mediaFolder, "image2 alt", doNotDelete: true);
        _image3 = Preconditions.UploadImage("ThirdImageName3", "jpg", _mediaFolder, "image3 alt", doNotDelete: true);
        _image = Preconditions.UploadImage("FirstImageName111", "jpg", Context.ApiHelper.PlatformGraphQlClient.GetItem(_mediaLibraryPath), "image1 alt", doNotDelete: true);

        Preconditions.WaitForImageToBeIndexed(_mediaLibraryPath, "FirstImageName1", expectedImages:2);
        Preconditions.WaitForImageToBeIndexed(_mediaLibraryPath, "SecondImageName2");
        Preconditions.WaitForImageToBeIndexed(_mediaLibraryPath, "ThirdImageName3");

        Preconditions.AddComponent(_testPage.itemId, _testPage.path, DefaultScData.RenderingId(DefaultScData.SxaRenderings.Image));

        Context.Pages.Editor.LeftHandPanel.SiteContentTree.RefreshTreeAtRootItem();
        Context.Pages.Editor.LeftHandPanel.SelectPage(_testPage.name);
    }

    [SetUp]
    public void OpenPage()
    {
        if (Context.Pages.Editor.IsMediaDialogOpened())
        {
            Context.Pages.Editor.MediaDialog.Cancel();
        }

        if (Context.Pages.Editor.TopBar.GetSelectedLanguage() != "English")
        {
            Context.Pages.Editor.TopBar.SelectLanguage("English");
        }

        Context.Pages.Editor.CurrentPage.Renderings.FirstOrDefault().ImageField.Container.Click();
        MediaDialog imageDialog = Context.Pages.Editor.RightHandPanel.ImageElementOptions.InvokeImageDialog();
        imageDialog.ImagesTree.GetAllVisibleItems().First(i => i.Name == _mediaFolder.name).Container.Click();
    }

    [OneTimeTearDown]
    public void CloseDialog()
    {
        if (Context.Pages.Editor.IsMediaDialogOpened())
        {
            Context.Pages.Editor.MediaDialog.Cancel();
        }
    }

    [Test]
    public void SearchImagesE2EFlow()
    {
        MediaDialog dialog = Context.Pages.Editor.MediaDialog;
        dialog.ImagesTree.GetAllVisibleItems().First(i => i.Name == Constants.SXAHeadlessSite).Container.Click();

        dialog.SearchFieldText.Should().BeEmpty();
        dialog.RemoveSearchPhraseButtonExists().Should().BeFalse();

        dialog.SetSearchPhrase("FirstImageName");
        dialog.GetImages().Count.Should().Be(2);
        dialog.GetImages().Should().Contain(_image1.name);
        dialog.GetImages().Should().Contain(_image.name);

        dialog.ImagesTree.GetAllVisibleItems().First(i => i.Name == _mediaFolder.name).Container.Click();
        dialog.Container.GetDriver().WaitForHorizonIsStable();
        dialog.SearchFieldText.Should().BeEquivalentTo("FirstImageName");
        dialog.GetImages().Count.Should().Be(1);
        dialog.GetImages().Should().Contain(_image1.name);
        dialog.GetImages().Should().NotContain(_image.name);

        dialog.SelectImage(_image1.name);
        SelectedImageDetails selectedDetails = dialog.SelectedImageDetails;
        selectedDetails.FileName.Should().Be(_image1.name);
        selectedDetails.Path.Should().Be(_image1.path.Replace("/sitecore/media library", ""));

        dialog.RemoveSearchPhraseByPressingButton();

        dialog.ImagesTree.SelectedItem.Name.Should().BeEquivalentTo(_mediaFolder.name);
        List<string> images = dialog.GetImages();
        images.Count.Should().Be(3);
        images.Should().Contain(_image1.name);
        images.Should().Contain(_image2.name);
        images.Should().Contain(_image3.name);
    }

    [Test]
    public void SearchForNonexistentImage()
    {
        MediaDialog dialog = Context.Pages.Editor.MediaDialog;
        dialog.SetSearchPhrase("SomeNonExistentImage");
        dialog.GetImages().Count.Should().Be(0);
        dialog.ImagesList.Text.Should().BeEquivalentTo("No results match your search phrase.\r\nTry again.");
    }

    [TestCase("*Image*", "FirstImageName1;SecondImageName2;ThirdImageName3")]
    [TestCase("*Image*3", "ThirdImageName3")]
    [TestCase("*First*Image*Name", "FirstImageName1")]
    [TestCase("*name3", "ThirdImageName3")]
    [TestCase("secon?image", "SecondImageName2")]
    public void SearchWithWildcards(string searchPhrase, string expectedResult)
    {
        List<string> expectedImages = expectedResult.Split(";").ToList();

        MediaDialog dialog = Context.Pages.Editor.MediaDialog;
        dialog.SetSearchPhrase(searchPhrase);

        List<string> images = dialog.GetImages();
        images.Count.Should().Be(expectedImages.Count);
        foreach (var image in expectedImages)
        {
            images.Should().Contain(image);
        }
    }

    [Test]
    public void SearchWorksAcrossLanguages()
    {
        const string ImageDanishDisplayName1 = "ImageDanishDisplayName1";
        const string ImageDanishDisplayName2 = "ImageDanishDisplayName2";
        const string ImageDanishDisplayName3 = "ImageDanishDisplayName3";

        _testPage.AddVersion("da");
        _testPage.SetFieldValue("__Final Renderings", _testPage.GetFieldValue("__Final Renderings"), "da");
        _mediaFolder.AddVersion("da");
        _image1.AddVersion("da");
        _image1.SetFieldValue("__Display name", ImageDanishDisplayName1, "da");
        _image2.AddVersion("da");
        _image2.SetFieldValue("__Display name", ImageDanishDisplayName2, "da");
        _image3.AddVersion("da");
        _image3.SetFieldValue("__Display name", ImageDanishDisplayName3, "da");

        Preconditions.WaitForImageToBeIndexed(_mediaFolder.itemId, ImageDanishDisplayName1, language: "da");
        Preconditions.WaitForImageToBeIndexed(_mediaFolder.itemId, ImageDanishDisplayName2, language: "da");
        Preconditions.WaitForImageToBeIndexed(_mediaFolder.itemId, ImageDanishDisplayName3, language: "da");

        Context.Pages.Editor.MediaDialog.Close();
        Context.Pages.Editor.TopBar.SelectLanguage("Danish");
        Context.Browser.GetDriver().WaitForDotsLoader();

        Context.Pages.Editor.CurrentPage.Renderings.FirstOrDefault().ImageField.Container.Click();
        MediaDialog imageDialog = Context.Pages.Editor.RightHandPanel.ImageElementOptions.InvokeImageDialog();
        imageDialog.ImagesTree.GetAllVisibleItems().First(i => i.Name == _mediaFolder.name).Container.Click();
        imageDialog.Container.GetDriver().WaitForHorizonIsStable();

        imageDialog.SetSearchPhrase("Image");
        imageDialog.WaitForImagePresent(ImageDanishDisplayName2);
        List<string> images = imageDialog.GetImages();
        images.Count.Should().Be(3);
        images.Should().Contain(ImageDanishDisplayName1);
        images.Should().Contain(ImageDanishDisplayName2);
        images.Should().Contain(ImageDanishDisplayName3);
    }

    [Test]
    public void SearchIsAppliedAutomaticallyIfThreeOrMoreCharactersEntered()
    {
        MediaDialog dialog = Context.Pages.Editor.MediaDialog;
        dialog.SetSearchPhrase("*");
        dialog.GetImages().Count.Should().Be(3);
        dialog.SetSearchPhrase("*e");
        dialog.GetImages().Count.Should().Be(3);
        dialog.SetSearchPhrase("*e1");
        dialog.GetImages().Count.Should().Be(1);
        dialog.GetImages().Should().Contain(_image1.name);

        dialog.SearchField.Clear();
        dialog.WaitForImagePresent(_image2.name);
        dialog.GetImages().Count.Should().Be(3);
    }
}
