// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using System.Linq;
using AutoFixture;
using FluentAssertions;
using NSubstitute;
using Sitecore.Data;
using Sitecore.Data.Items;
using Sitecore.Horizon.Integration.Items.Workflow;
using Sitecore.Horizon.Integration.Tests.Unit.AutoFixture;
using Sitecore.Workflows;
using Xunit;

namespace Sitecore.Horizon.Integration.Tests.Unit.Items.Workflow
{
    public class HorizonWorkflowFiltererTests
    {
        [Theory]
        [AutoNData]
        internal void HorizonWorkflowFilter_ShouldFilterCommands(
            Database db,
            Item item,
            Generator<WorkflowCommand> generator,
            HorizonWorkflowFilterer sut)
        {
            // act
            db.GetItem(item.ID.ToString()).Returns(item);
            var commands = generator.Take(3).ToArray();
            Sitecore.Context.ContentDatabase = db;
            var filtered = sut.FilterVisibleCommands(commands, item, db);

            // assert
            filtered.Select(f => f.CommandID).Should().BeEquivalentTo(commands.Select(c => c.CommandID));
        }
    }
}
