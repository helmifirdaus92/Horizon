// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using OpenQA.Selenium;
using Sitecore.E2E.Test.Framework;
using Sitecore.E2E.Test.Framework.Controls;
using Sitecore.Pages.E2EFramework.UI.Tests.Wrappers.Components.TopPanel;
using Sitecore.Pages.E2EFramework.UI.Tests.Wrappers.Components.Versions;

namespace Sitecore.Pages.E2EFramework.UI.Tests.Wrappers.Components;

public class EditorHeader : BaseControl
{
    private const string VersionListPopOverLocator = "ng-spd-popover app-version-list";
    private readonly Action? _canvasReloadWaitMethod;

    public EditorHeader(IWebElement container, Action? canvasReloadWaitMethod) : base(container)
    {
        _canvasReloadWaitMethod = canvasReloadWaitMethod;
    }

    private IWebElement _reloadCanvas => Container.FindElement("#reloadCanvas");
    private IWebElement _undo => Container.FindElement("app-save-undo-redo [title=Undo]");
    private IWebElement _redo => Container.FindElement("app-save-undo-redo [title=Redo]");
    private IWebElement _saveIndicator => Container.FindElement("app-save-undo-redo app-save-indicator");
    private Button _versionsButton => Container.FindControl<Button>("app-versions #versionListBtn");
    public VersionList VersionsList => new(get_versionsList(), _canvasReloadWaitMethod ?? throw new InvalidOperationException());
    public string VersionInfo => _versionsButton.Name;

    public DeviceSwitcher Device
    {
        get
        {
            return new DeviceSwitcher(Container.FindElement("app-device-selector"));
        }
    }

    public bool IsUndoActive()
    {
        return _undo.Enabled;
    }

    public bool IsRedoActive()
    {
        return _redo.Enabled;
    }

    public void Undo(bool layoutChange = true)
    {
        _undo.Click();
        if (layoutChange)
        {
            _canvasReloadWaitMethod?.Invoke();
        }

        WaitUntilAutoSaveAtInactivity();
        _undo.GetDriver().WaitForHorizonIsStable();
    }

    public void Redo(bool layoutChange = true)
    {
        _redo.Click();
        if (layoutChange)
        {
            _canvasReloadWaitMethod?.Invoke();
        }

        WaitUntilAutoSaveAtInactivity();
        _redo.GetDriver().WaitForHorizonIsStable();
    }

    public void WaitUntilAutoSaveAtInactivity(int timeOutInSeconds=2)
    {
        _saveIndicator.WaitForCondition(c => !c.CheckElementExists(".mdi-loading"), TimeSpan.FromSeconds(timeOutInSeconds), message: $"Save didn't happen in {timeOutInSeconds}Seconds");
    }

    public VersionList OpenVersions()
    {
        _versionsButton.Click();
        Container.GetDriver().WaitForHorizonIsStable();
        return VersionsList;
    }

    public void CloseVersionsList()
    {
        if (Container.GetDriver().CheckElementExists(VersionListPopOverLocator))
        {
            get_versionsList().ClickOutside(x: 200);
        }
    }
    public void ReloadCanvas()
    {
        _reloadCanvas.Click();
        Container.GetDriver().WaitForDotsLoader();
        _canvasReloadWaitMethod?.Invoke();
    }

    private IWebElement get_versionsList()
    {
        Container.GetDriver().WaitForHorizonIsStable();
        return Container.GetDriver().FindElement(VersionListPopOverLocator);
    }
}
