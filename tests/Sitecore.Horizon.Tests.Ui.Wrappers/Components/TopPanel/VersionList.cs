// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using System.Collections.Generic;
using System.Linq;
using System.Text.RegularExpressions;
using Sitecore.Horizon.Integration.Tests.Ui.Wrappers.Components.ItemsList;
using UTF;

namespace Sitecore.Horizon.Integration.Tests.Ui.Wrappers.Components.TopPanel
{
    public class VersionList
    {
        private readonly WebElement _versionList;

        private readonly string _contextMenuLocator = "ng-spd-popover .actions-list";

        public VersionList(WebElement versionList)
        {
            _versionList = versionList;
        }

        public int Version => int.Parse(VersionNumber());
        public string Name => _details[0];
        public WebElement ContextMenuDots => _versionList.FindElement("button[icon='dots-horizontal']");

        public bool IsSelected => _versionList.GetClassList().Contains("highlight");

        private IList<string> _details => _versionList.FindElements("span")
            .Select(d => d.Text).ToList();

        public void Select()
        {
            _versionList.FindElement(".list-items").Click();
            _versionList.Driver.WaitForHorizonIsStable();
        }


        public ContextMenu OpenContextMenu()
        {
            _versionList.Driver.WaitForHorizonIsStable();
            _versionList.Hover();
            ContextMenuDots.Click();
            _versionList.Driver.WaitForHorizonIsStable();
            return new ContextMenu(_versionList.Driver.FindElement(_contextMenuLocator));
        }

        public void CloseContextMenu()
        {
            _versionList.Hover();
            ContextMenuDots.Click();
            this.WaitForCondition(c => !_versionList.Driver.CheckElementExists(_contextMenuLocator));
            _versionList.Driver.WaitForHorizonIsStable();
        }


        private string VersionNumber()
        {
            var value = _details[1];
            var match = Regex.Match(value, @"\d+").Value;
            return match;
        }
    }
}
