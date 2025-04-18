// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using System;
using System.Drawing;
using System.Drawing.Imaging;
using System.IO;
using System.Threading;
using Sitecore.Horizon.Integration.GraphQL.Tests.Helpers;
using Sitecore.Pages.E2EFramework.UI.Tests.ApiHelpers.PlatformGraphQL;
using Constants = Sitecore.Horizon.Integration.GraphQL.Tests.Helpers.Constants;
using Item = Sitecore.Pages.E2EFramework.UI.Tests.ApiHelpers.PlatformGraphQL.Types.Item;

namespace Sitecore.Horizon.Integration.GraphQL.Tests.Tests.ImagesDialog;

public static class ImagesDialogHelpers
{
    public static Item UploadImage(string name, string extension, string destinationFolderId, string destinationFolderPath, string altText = null, string language = "en", int width = 150, int height = 150, bool doNotDelete = false)
    {
        altText ??= $"{name}.{extension}";

        Context.ApiHelper.HorizonGraphQlClient.UploadMedia(name, extension, blob:
            Convert.ToBase64String(CreateImage(width, height, $"{name}.{extension}")), destinationFolderId, site: Constants.SXAHeadlessSite);

        Item imageItem = Context.ApiHelper.PlatformGraphQlClient.GetItem($"{destinationFolderPath}/{name}");
        TestData.Items.Add(imageItem);
        imageItem.SetFieldValue("Alt", altText);

        return imageItem;
    }

    public static void WaitForImagesToBeIndexed()
    {
        Thread.Sleep(7000);
    }

    public static byte[] CreateImage(int width, int height, string textOnImage, Color? color = null)
    {
        Color backColor = color ?? Color.AntiqueWhite;

        Image image = DrawTextImage($"{textOnImage}", Color.Green, backColor, new Size(width, height));
        byte[] data = ConvertToByteArray(image);

        return data;
    }

    private static Image DrawTextImage(string textOnImage, Color textColor, Color backColor, Size minSize)
    {
#pragma warning disable CA1416
        Image retImg = new Bitmap(minSize.Width, minSize.Height);
        using var drawing = Graphics.FromImage(retImg);
        drawing.Clear(backColor);

        using Brush textBrush = new SolidBrush(textColor);
        drawing.DrawString(textOnImage, new Font(FontFamily.GenericSerif, 12), textBrush, 0, 0);
        drawing.Save();
#pragma warning restore CA1416

        return retImg;
    }

    private static byte[] ConvertToByteArray(Image image)
    {
        using var ms = new MemoryStream();
#pragma warning disable CA1416
        image.Save(ms, ImageFormat.Jpeg);
#pragma warning restore CA1416
        return ms.ToArray();
    }
}
