// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.RegularExpressions;
using UTF;

namespace Sitecore.Horizon.Integration.Tests.Ui.Wrappers.Components.RightPanel
{
    public class VersionsSection
    {
        private readonly WebElement _versions;

        public VersionsSection(WebElement versions)
        {
            _versions = versions;
        }

        public string Header => _versions.FindElement("h5").Text;

        public VersionsPanel VersionsPanel => new(_versions.FindElement("ng-spd-slide-in-panel"));
        public CreateVersion CreateVersion => new(_versions.FindElement("ng-spd-slide-in-panel:nth-of-type(2)"));
        public RenameVersion RenameVersion => new(_versions.FindElement("ng-spd-slide-in-panel:nth-of-type(2)"));

        public PublishingDates PublishingDates => new(_versions.FindElement("ng-spd-slide-in-panel:nth-of-type(2)"));

        public string LastModifiedBy => LastModified[1].Trim();

        public DateTime LastModifiedAt => DateTime.Parse(LastModified[0]);

        public int Version => int.Parse(Details[0]);

        public string Name => Details[1];

        public IList<string> Details => _activeVersion.FindElements("p")
            .Select(d => d.Text
                .Split(new[]
                {
                    ":"
                }, StringSplitOptions.None).Last().Trim())
            .ToList();

        public string[] LastModified => Details[2].Split(new[]
        {
            "by"
        }, StringSplitOptions.None);

        private WebElement _activeVersion => _versions.FindElement("app-active-version");

        public int CountOfVersionsInHeader()
        {
            HeaderMatchesPattern(out GroupCollection groups);
            return int.Parse(groups["count"].ToString());
        }

        public string GetHeaderLabel()
        {
            return Header.Split(' ').FirstOrDefault();
        }

        public void OpenVersionsOverviewPanel()
        {
            _activeVersion.Click();
            _versions.FindElement("ng-spd-slide-in-panel:nth-of-type(1)").WaitForCSSAnimation();
            _activeVersion.Driver.WaitForHorizonIsStable();
        }

        public bool HeaderMatchesPattern(out GroupCollection groups)
        {
            Regex pattern = new(@"(?<label>\w+) \((?<count>\d+)\)");
            groups = pattern.Match(Header).Groups;
            return groups != null;
        }
    }
}
