// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using System;
using System.Collections.Generic;
using System.Linq;
using Sitecore.Horizon.Integration.Tests.Ui.ApiHelpers.HorizonEntities;
using Sitecore.Horizon.Integration.Tests.Ui.Wrappers.Components.ItemsList;
using UTF;

namespace Sitecore.Horizon.Integration.Tests.Ui.Wrappers.Components.RightPanel
{
    public class VersionCard
    {
        private readonly WebElement _versionCard;

        private readonly string _contextMenuLocator = "ng-spd-popover";

        public VersionCard(WebElement versionCard)
        {
            _versionCard = versionCard;
        }

        public int Version => int.Parse(_details[0]);
        public string Name => _details[1];
        public PageWorkflowState Workflow => (PageWorkflowState)Enum.Parse(typeof(PageWorkflowState), _details[2].Replace(" ", String.Empty), true);
        public string LastModifiedBy => _lastModified[1].Trim();

        public DateTime LastModifiedAt => DateTime.Parse(_lastModified[0]);

        public string PublishStart => _publishDetails[0].Trim();
        public string PublishEnd => _publishDetails[1].Trim();

        public WebElement ContextMenuDots => _versionCard.FindElement("button[icon='dots-horizontal']");

        public bool IsSelected => _versionCard.GetClassList().Contains("selected");

        public string PublishInfo => _details[4].Trim();

        private string[] _publishDetails => PublishInfo.Split(new[]
        {
            '-'
        }, StringSplitOptions.None);

        private IList<string> _details => _versionCard.FindElements("p")
            .Select(d => d.Text
                .Split(new[]
                {
                    ':'
                }, 2).Last().Trim())
            .ToList();

        private string[] _lastModified => _details[3].Split(new[]
        {
            "by"
        }, StringSplitOptions.None);

        public void Select()
        {
            _versionCard.Click();
            _versionCard.Driver.WaitForHorizonIsStable();
        }

        public ContextMenu OpenContextMenu()
        {
            _versionCard.Driver.WaitForHorizonIsStable();
            _versionCard.Hover();
            ContextMenuDots.Click();
            _versionCard.Driver.WaitForHorizonIsStable();
            return new ContextMenu(_versionCard.Driver.FindElement(_contextMenuLocator));
        }

        public void CloseContextMenu()
        {
            _versionCard.Hover();
            ContextMenuDots.Click();
            this.WaitForCondition(c => !_versionCard.Driver.CheckElementExists(_contextMenuLocator));
            _versionCard.Driver.WaitForHorizonIsStable();
        }
    }
}
