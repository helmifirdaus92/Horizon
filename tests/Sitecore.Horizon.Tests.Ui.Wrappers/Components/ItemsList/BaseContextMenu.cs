// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using UTF;

namespace Sitecore.Horizon.Integration.Tests.Ui.Wrappers.Components.ItemsList;

public abstract class BaseContextMenu
{
    protected readonly WebElement _contextMenu;

    protected BaseContextMenu(WebElement element)
    {
        _contextMenu = element;
    }

    public void Close()
    {
        //wait for context menu fully renders since document.elementFromPoint() is used below
        _contextMenu.Driver.WaitForHorizonIsStable();
        var script = $@"
                var x = {_contextMenu.GetElementRectangle().X - 20};
                var y = {_contextMenu.GetElementRectangle().Y + 20};

                var ev = new MouseEvent('click', {{
                'view': window,
                'bubbles': true,
                'cancelable': true,
                'screenX': x,
                'screenY': y
                }});

                var el = document.elementFromPoint(x, y);
                el.dispatchEvent(ev);
            ";
        _contextMenu.Driver.ExecuteJavaScript(script);
        _contextMenu.Driver.WaitForHorizonIsStable();
    }
}
