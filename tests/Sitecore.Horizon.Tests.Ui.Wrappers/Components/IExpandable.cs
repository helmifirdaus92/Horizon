// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

namespace Sitecore.Horizon.Integration.Tests.Ui.Wrappers.Components
{
    public interface IExpandable
    {
        bool IsExpanded { get; }
        void Expand();
        void Collapse();
    }
}
