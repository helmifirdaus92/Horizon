// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using System.Collections.ObjectModel;
using System.Drawing;
using OpenQA.Selenium;
using Sitecore.E2E.Test.Framework;
using Sitecore.Pages.E2EFramework.UI.Tests.Wrappers.Browser;
using Sitecore.Pages.E2EFramework.UI.Tests.Wrappers.Controls;
using Sitecore.Pages.E2EFramework.UI.Tests.Wrappers.Data;

namespace Sitecore.Pages.E2EFramework.UI.Tests.Wrappers.Components.PageLayout;

public class PageLayout : BasePage
{
    private const string FrameSelector = "div[class*='sc-frame--'][select]";
    private readonly IWebDriver _canvas;
    private readonly Point _frameLocation;
    private BrowserWrapper _browser;

    public PageLayout(string frameSccSelector, IWebDriver driver) : base(driver)
    {
        _browser = new(driver);
        (_canvas, _frameLocation) = _browser.GetFrame(frameSccSelector);
    }

    public NamedCollection<CanvasPlaceholder> EmptyPlaceholders =>
        _canvas.FindNamedControls<CanvasPlaceholder>("div[id=emptySpacerContainer]", _frameLocation);

    public ReadOnlyCollection<Rendering> Renderings => _canvas.FindControls<Rendering>(".component[style='cursor: pointer;']>.component-content");

    public List<ContentEditable> TextInputs => Renderings.Select(r => r.Container.FindControl<ContentEditable>("[contenteditable]")).ToList();

    public CanvasSelectionFrame SelectionFrame => new(_canvas.FindElement(FrameSelector));

    public RTEditorControls RtEditorControls => new(_canvas.FindElement(".ck-balloon-panel_visible.ck-toolbar-container"));

    public IWebElement PersonalizationLabel => _canvas.FindElement("div[class*='sc-personalization-label']:not([class*=not-personalized])>[class*=target-account]");
    private IWebElement ActiveAbTestIcon => _canvas.FindElement("div[class*='sc-personalization-label'] [class*='test-component']");

    private IWebElement Body => _canvas.FindElement("body");

    public CanvasHoverFrame GetHoveredFrame(bool throwIfNotFound = true) => new CanvasHoverFrame(_canvas.FindElement("body")).TryFindFrame(_browser.GetDriver(), throwIfNotFound)!;

    public void Click()
    {
        Body.Click();
    }

    /*
     * The css selector to locate the AbTestIcon works only when there is only one active Ab test on the page.
     * To work with multiple active tests, locator needs to be updated.
     */
    public void SelectComponentWithActiveAbTest()
    {
        ActiveAbTestIcon.Click();
        ActiveAbTestIcon.GetDriver().WaitForHorizonIsStable();
    }

    public void ClickBackButtonOnDocumentNoFound()
    {
        Body.FindElement(".sc-backbutton").Click();
    }

    public string GetText()
    {
        var body = _canvas.FindElement("body");
        return body.GetAttribute("innerText");
    }

    public object ExecuteJavaScript(string script)
    {
        return _canvas.ExecuteJavaScript<object>(script);
    }

    public CanvasField GetFieldControl(string cssSelector)
    {
        return new CanvasField(_canvas.FindElement($"{cssSelector}"));
    }

    public bool IsFieldSelectable(string containsValue)
    {
        return _canvas.CheckElement($"[value*='{containsValue}']~.scWebEditInput") != null;
    }

    public CanvasControl GetControl(string renderingName)
    {
        return new CanvasControl(_canvas.FindElement(GetRenderingLocator(renderingName)));
    }

    public CanvasControl GetControlWithCss(string cssLocator)
    {
        return new CanvasControl(_canvas.FindElement(cssLocator));
    }

    public Rendering? GetRenderingByName(string renderingName)
    {
        if (!GetRenderingLocator(renderingName).Equals(string.Empty))
        {
            return _canvas.FindControl<Rendering>(GetRenderingLocator(renderingName));
        }

        Console.WriteLine("Rendering locator not defined..");
        return null;
    }

    public bool isRenderingNotEditable(string renderingName)
    {
        return _canvas.CheckElementExists(GetNotEditableRenderingLocator(renderingName));
    }

    public bool IsRenderingPresentInCanvas(string renderingName)
    {
        return _canvas.CheckElementExists(GetRenderingLocator(renderingName));
    }

    public List<Rendering> GetAllRenderingsUnderPlaceholder(string placeholderName)
    {
        var placeholder = _canvas.FindElement($"code[chrometype=placeholder][kind=open][id*={placeholderName}]");
        return placeholder.GetParent().FindControls<Rendering>("code[chrometype=rendering][kind=open]+div.component").ToList();
    }

    public CanvasPlaceholder GetPlaceholderControl(string name)
    {
        var (codeSelector, containerSelector) = DataHelper.GetPlaceholderSelectors(name);
        return new CanvasPlaceholder(_canvas.FindElement(containerSelector), _frameLocation);
    }

    public bool IsRenderingPresentInPlaceholder(string placeholderName, string renderingName)
    {
        var placeholder = _canvas.FindElement($"code[chrometype=placeholder][kind=open][id*={placeholderName}]");
        List<Rendering> renderings = placeholder.GetParent().FindControls<Rendering>("code[chrometype=rendering][kind=open]+div.component").ToList();
        return renderings.Any(r => r.Container.GetClassList().Contains(Constants.RenderingNameInHtmlFromName(renderingName)));
    }

    public bool IsARenderingHiddenInPlaceholder(string placeholderName)
    {
        var hiddenFrame = HiddenFrameInCanvasPlaceHolder(placeholderName);
        var script = @" return (arguments[0].style[0]==='background-image' || arguments[0].style[0]==='background-color') && arguments[0].textContent==='The component is hidden'";
        return _canvas.ExecuteJavaScript<bool>(script, hiddenFrame);
    }

    public string HiddenRenderingInPlaceholder(string placeholderName)
    {
        var hiddenFrame = HiddenFrameInCanvasPlaceHolder(placeholderName);
        hiddenFrame.Click();
        hiddenFrame.GetDriver().WaitForHorizonIsStable();
        return SelectionFrame.ChipElement.Name;
    }

    public void ClearAndFillTextField(string text)
    {
        TextInputs[0].Clear();
        TextInputs[0].Container.ClickOutside();
        TextInputs[0].Text = text;
    }

    private static string GetRenderingLocator(string renderingName)
    {
        string nameInComponentDefinition = Constants.RenderingNameInHtmlFromName(renderingName);
        return $".component.{nameInComponentDefinition}[style='cursor: pointer;']";
    }

    private static string GetNotEditableRenderingLocator(string renderingName)
    {
        string nameInComponentDefinition = Constants.RenderingNameInHtmlFromName(renderingName);

        return $".component.{nameInComponentDefinition}:not([style='cursor: pointer;'])";
    }

    private IWebElement HiddenFrameInCanvasPlaceHolder(string placeholderName)
    {
        var placeholder = _canvas.FindElement($"code[chrometype=placeholder][kind=open][id*={placeholderName}]");
        var script = @"
            var phElement = arguments[0];
            var hiddenFrame= phElement.parentElement.querySelector('code[chrometype=rendering][kind=open]').nextSibling
            return hiddenFrame
            ";
        return _canvas.ExecuteJavaScript<IWebElement>(script, placeholder);
    }
}
