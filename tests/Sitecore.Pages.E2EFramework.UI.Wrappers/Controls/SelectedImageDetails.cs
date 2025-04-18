// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using OpenQA.Selenium;
using Sitecore.E2E.Test.Framework;

namespace Sitecore.Pages.E2EFramework.UI.Tests.Wrappers.Controls;

public class SelectedImageDetails : BaseControl
{
    public SelectedImageDetails(IWebElement container, params object[] parameters) : base(container, parameters)
    {
    }

    public string ThumbnailSource => ImageThumbnail.GetAttribute("src");
    public string ThumbnailAlternativeText => ImageThumbnail.GetAttribute("alt");
    public string FileName => Container.FindElement(".field-value:nth-of-type(2)").Text;
    public string FileType => Container.FindElement(".field-value:nth-of-type(4)").Text;
    public string FileSize => Container.FindElement(".field-value:nth-of-type(6)").Text;
    public string Dimensions => Container.FindElement(".field-value:nth-of-type(8)").Text;
    public string Path => Container.FindElement(".field-value:nth-of-type(10)").Text;
    public string AlternativeText => Container.FindElement(".field-value:nth-of-type(12)").Text;

    private IWebElement ImageThumbnail => Container.FindElement("img");
}
