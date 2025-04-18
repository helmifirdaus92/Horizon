// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using OpenQA.Selenium;
using Sitecore.E2E.Test.Framework;
using Sitecore.E2E.Test.Framework.Controls;
using Sitecore.Pages.E2EFramework.UI.Tests.Wrappers.Data;

namespace Sitecore.Pages.E2EFramework.UI.Tests.Wrappers.Components.PageLayout;

public class Rendering : CanvasControl
{
    public Rendering(IWebElement container) : base(container)
    {
    }

    public CanvasField ImageField => new(Container.FindElement("img"));
    public ContentEditable LinkField => new(Container.FindElement(".sc-link-wrapper , .field-link>span , .field-link>a, .field-promolink>span, .field-promolink>a"));
    public ContentEditable NumberField => new(GetContentEditableFieldWebElementOfType("Number"));
    public ContentEditable DateField => new(GetContentEditableFieldWebElementOfType("Date"));
    public ContentEditable DateTimeField => new(GetContentEditableFieldWebElementOfType("Datetime"));
    public CanvasField GeneralLink => new(GetFieldWebElementOfType("General Link"));
    public ContentEditable IntegerField => new(GetContentEditableFieldWebElementOfType("Integer"));
    public ContentEditable SingleLineTextField => new (GetContentEditableFieldWebElementOfType("Single-Line Text"));
    public ContentEditable MultiLineTextField => new (GetContentEditableFieldWebElementOfType("Multi-Line Text"));
    public ContentEditable RichTextField => new (GetContentEditableFieldWebElementOfType("Rich Text"));
    public string RenderingName => Constants.RenderingNameFromInHtml(Container.GetClassList()[1]);


    public override void Select()
    {
        Container.WaitForCondition(c => c.Enabled);
        Container.Hover();
        Container.GetDriver().WaitForHorizonIsStable();
        Container.Click();
    }

    public override void Hover()
    {
        Container.WaitForCondition(c => c.Enabled);
        Container.Hover();
        Container.GetDriver().WaitForHorizonIsStable();
    }
    public bool IsRenderingHiddenInPlaceholder(string renderingName)
    {
        IWebElement parent = Container.GetParent();

        List<IWebElement> allRenderingsCodeElements = parent.FindElements("code[chrometype='rendering'][kind='open']").ToList();
        IWebElement rendering = allRenderingsCodeElements.Find(e => e.GetAttribute("hintname").Equals(renderingName))!.GetNextSibling();

        return rendering.GetInnerHtml().Contains("bg_hidden_rendering.png");
    }

    public bool IsRenderingOnPage(string renderingName)
    {
        IWebElement parent = Container.GetParent();
        List<IWebElement> allRenderingsCodeElements = parent.FindElements("code[chrometype='rendering'][kind='open']").ToList();
        bool renderingOnPage = allRenderingsCodeElements.Any(e => e.GetAttribute("hintname").Equals(renderingName));
        return renderingOnPage;
    }

    public bool IsEditableControlAvailable()
    {
        return Container.CheckElementExists(".scWebEditInput");
    }

    private IWebElement GetContentEditableFieldWebElementOfType(string fieldType)
    {
        string script = $@"
            var parent = arguments[0];
            var codes = parent.querySelectorAll('.component-content code[kind=open], .component-content .scChromeData');
            for (var i = 0; i < codes.length; i++) {{
                var code = codes[i];
                if (code.textContent.includes('""fieldType"":""{fieldType}""')) {{
                    return code.parentElement.querySelector('[contenteditable]');
                }}
            }}
            return null;";
        try
        {
            return Container.GetDriver().ExecuteJavaScript<IWebElement>(script,Container);

        }
        catch (Exception ex)
        {
            throw new InvalidOperationException($"Failed to execute script for fieldType {fieldType}", ex);
        }
    }

    private IWebElement GetFieldWebElementOfType(string fieldType)
    {
        string script = $@"
            var parent = arguments[0];
            var codes = parent.querySelectorAll('.component-content code[kind=open], .component-content .scChromeData');
            for (var i = 0; i < codes.length; i++) {{
                var code = codes[i];
                if (code.textContent.includes('""fieldType"":""{fieldType}""')) {{
                    return code.parentElement.querySelector(""[style='cursor: pointer;']"");
                }}
            }}
            return null;";
        try
        {
            return Container.GetDriver().ExecuteJavaScript<IWebElement>(script, Container);

        }
        catch (Exception ex)
        {
            throw new InvalidOperationException($"Failed to execute script for fieldType {fieldType}", ex);
        }
    }
}
