// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using System.Drawing;
using Sitecore.Horizon.Integration.Tests.Ui.Wrappers.Components.LeftPanel;

namespace Sitecore.Horizon.Integration.Tests.Ui.Wrappers.Components.ItemsList
{
    public interface IContextMenu
    {
        Rectangle Rectangle { get; }
        void InvokeDelete();
        void InvokeRename();
        CreateFolderSlidingPanel InvokeCreateFolder();
        SelectTemplateDialog InvokeCreatePage();
        SelectTemplateDialog InvokeCreatePageOnSameLevel();
        bool IsButtonEnabled(ContextMenuButtons button);
        void Close();
        string GetButtonTitle(ContextMenuButtons button);
    }
}
