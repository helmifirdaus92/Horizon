// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using System.Collections;
using System.Collections.Generic;

namespace Sitecore.Horizon.Integration.Tests.Unit.Helper
{
    internal class TreeNode : IEnumerable<TreeNode>
    {
        public readonly string Name;

        private readonly Dictionary<string, TreeNode> _children = new Dictionary<string, TreeNode>();

        public TreeNode(string name)
        {
            Name = name;
        }

        public TreeNode Parent { get; private set; }

        public void Add(TreeNode item)
        {
            item.Parent = this;
            _children.Add(item.Name, item);
        }

        public IEnumerator<TreeNode> GetEnumerator() => _children.Values.GetEnumerator();

        IEnumerator IEnumerable.GetEnumerator() => GetEnumerator();
    }
}
