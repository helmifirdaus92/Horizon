// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using System.Drawing;
using OpenQA.Selenium;
using Sitecore.E2E.Test.Framework;
using Sitecore.E2E.Test.Framework.Controls;
using Sitecore.Pages.E2EFramework.UI.Tests.Wrappers.Components.LeftHandPanel;
using Sitecore.Pages.E2EFramework.UI.Tests.Wrappers.Controls.Dialog;
using Sitecore.Pages.E2EFramework.UI.Tests.Wrappers.Data;

namespace Sitecore.Pages.E2EFramework.UI.Tests.Wrappers.Controls
{
    public class ContextMenu : BaseControl
    {
        public ContextMenu(IWebElement container) : base(container)
        {
        }

        public enum ContextMenuButtons
        {
            Delete,
            CreateSubPage,
            CreateFolder,
            CreateNew,
            Rename,
            RenameItem,
            SchedulePublishingAvailability,
            Duplicate,
            RenamePageVariant,
            EditAudience,
            Folder,
            PartialDesign,
            PageDesign,
            Edit,
            OpenInExplorer,
            Settings,
            MoveTo,
            ManageFields,
            DeleteVariant,
            RenameVariant,
            ResetVariant
        }

        public Rectangle Rectangle => Container.GetElementRectangle();

        private NamedCollection<Button> Items
        {
            get
            {
                const string cssLocator = "button, a";
                Container
                    .WaitForCondition(c => c.FindNamedControls<Button>(cssLocator)
                        .All(b => b.Name != null));
                return Container.FindNamedControls<Button>(cssLocator);
            }
        }

        public CreateDialog InvokeCreatePartialDesign()
        {
            SelectOption(ContextMenuButtons.PartialDesign);
            Container.GetDriver().WaitForDialog();
            Container.GetDriver().WaitForHorizonIsStable();
            return new CreateDialog(Container.GetDriver().FindElement(Constants.DialogPanelLocator));
        }

        public CreateDialog InvokeCreatePageDesign()
        {
            SelectOption(ContextMenuButtons.PageDesign);
            Container.GetDriver().WaitForDialog();
            Container.GetDriver().WaitForHorizonIsStable();
            return new CreateDialog(Container.GetDriver().FindElement(Constants.DialogPanelLocator));
        }

        public void InvokeCreateFolder()
        {
            SelectOption(ContextMenuButtons.Folder);
        }

        public CreateFolderSlidingPanel? InvokeCreatePageFolder(bool ExpectSlidingPanel = true)
        {
            SelectOption(ContextMenuButtons.CreateFolder);
            if (ExpectSlidingPanel)
            {
                Container.GetDriver().FindElement(Constants.CreateFolderPanelSelector).WaitForCssAnimation();
                Container.GetDriver().WaitForHorizonIsStable();
                return new CreateFolderSlidingPanel(Container.GetDriver().FindElement(Constants.CreateFolderPanelSelector));
            }
            else
            { return null; }
            
        }

        public void SelectOption(ContextMenuButtons button)
        {
            var buttonText = GetButtonText(button);
            Items.First(element => element.Name.Equals(buttonText)).Click();
        }

        public bool IsOptionEnabled(ContextMenuButtons button)
        {
            var buttonText = GetButtonText(button);

            var option = Items.First(element => element.Name == buttonText);
            return option.IsEnabled;
        }

        public bool IsContextMenuDisplayed()
        {
            return Container.Displayed;
        }

        public void InvokeRename()
        {
            SelectOption(ContextMenuButtons.Rename);
        }

        public RenameDialog InvokeRenameItem()
        {
            SelectOption(ContextMenuButtons.RenameItem);
            return new RenameDialog(Container.GetDriver().FindElement(Constants.RenameItemDialogLocator));
        }

        public PageDetailsDialog InvokePageDetailsDialog()
        {
            SelectOption(ContextMenuButtons.Settings);
            return new PageDetailsDialog(Container.GetDriver().FindElement(Constants.PageDetailsDialogLocator));
        }

        public void InvokeMoveTo()
        {
            SelectOption(ContextMenuButtons.MoveTo);
        }

        public void InvokeDuplicate()
        {
            SelectOption(ContextMenuButtons.Duplicate);
        }

        public void InvokeDelete()
        {
            SelectOption(ContextMenuButtons.Delete);
        }

        public void InvokeEditAudience()
        {
            SelectOption(ContextMenuButtons.EditAudience);
        }

        public void InvokeRenamePageVariant()
        {
            SelectOption(ContextMenuButtons.RenamePageVariant);
        }

        public void InvokeRenameVariant()
        {
            SelectOption(ContextMenuButtons.RenameVariant);
        }

        public void InvokeDeleteVariant()
        {
            SelectOption(ContextMenuButtons.DeleteVariant);
        }

        public void InvokeResetVariant()
        {
            SelectOption(ContextMenuButtons.ResetVariant);
        }

        public void InvokeSchedulePublishingAvailability()
        {
            SelectOption(ContextMenuButtons.SchedulePublishingAvailability);
        }

        public void InvokeCreateNew()
        {
            SelectOption(ContextMenuButtons.CreateNew);
        }

        public SelectTemplateDialog InvokeCreateSubPage()
        {
            SelectOption(ContextMenuButtons.CreateSubPage);
            return new SelectTemplateDialog(Container.GetDriver().FindElement(Constants.TemplateSelectionDialogLocator));
        }

        private string? GetButtonText(ContextMenuButtons button)
        {
            return button switch
            {
                ContextMenuButtons.Delete => "Delete",
                ContextMenuButtons.CreateSubPage => "Create a subpage",
                ContextMenuButtons.CreateFolder => "Create a folder",
                ContextMenuButtons.CreateNew => "Create new",
                ContextMenuButtons.Rename => "Rename",
                ContextMenuButtons.RenameItem => "Rename item",
                ContextMenuButtons.SchedulePublishingAvailability => "Schedule publishing availability",
                ContextMenuButtons.Duplicate => "Duplicate",
                ContextMenuButtons.RenamePageVariant => "Rename page variant",
                ContextMenuButtons.EditAudience => "Edit audience",
                ContextMenuButtons.Folder => "Folder",
                ContextMenuButtons.PartialDesign => "Partial design",
                ContextMenuButtons.PageDesign => "Page design",
                ContextMenuButtons.Edit => "Edit",
                ContextMenuButtons.OpenInExplorer => "Open in Explorer",
                ContextMenuButtons.Settings => "Settings",
                ContextMenuButtons.MoveTo => "Move to",
                ContextMenuButtons.ManageFields => "Manage Fields",
                ContextMenuButtons.DeleteVariant => "Delete variant",
                ContextMenuButtons.RenameVariant => "Rename variant",
                ContextMenuButtons.ResetVariant => "Reset variant",
                _ => null
            };
        }
    }
}
