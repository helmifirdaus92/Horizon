// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using AutoFixture.Xunit2;
using NSubstitute;
using Sitecore.Abstractions;
using Sitecore.Data;
using Sitecore.Data.Items;
using Sitecore.Globalization;
using Sitecore.Horizon.Integration.ExternalProxy;
using Sitecore.Horizon.Integration.Pipelines.HorizonSaveItem;
using Sitecore.Horizon.Integration.Tests.Unit.AutoFixture;
using Sitecore.Pipelines.Save;
using Sitecore.Workflows;
using Xunit;
using WorkflowSaveCommand = Sitecore.Horizon.Integration.Pipelines.HorizonSaveItem.WorkflowSaveCommand;

namespace Sitecore.Horizon.Integration.Tests.Unit.Pipelines.HorizonSaveItem
{
    public class WorkflowSaveCommandTests
    {
        [Theory]
        [InlineAutoNData("__OnSave", true)]
        [InlineAutoNData("Other", false)]
        internal void Process_ShouldExecuteOnSaveWorkflowCommands(
            string commandItemName,
            bool shouldBeCalled,
            [Frozen] ISitecoreContext context,
            [Frozen] BaseClient client,
            WorkflowSaveCommand sut)
        {
            // arrange
            var item = Substitute.For<Item>(ID.NewID, ItemData.Empty, Substitute.For<Database>());

            var workflowProvider = Substitute.For<IWorkflowProvider>();
            var workflow = Substitute.For<IWorkflow>();
            var commands = new[]
            {
                new WorkflowCommand("command1", "displayName1", "icon", false),
                new WorkflowCommand("command2", "displayName2", "icon", false),
                new WorkflowCommand("command3", "displayName3", "icon", false),
            };

            workflow.GetCommands(item).Returns(commands);
            workflow.GetState(item).Returns(Substitute.For<WorkflowState>("stateId", "displayName", "icon", false));
            workflowProvider.GetWorkflow(item).Returns(workflow);
            client.ContentDatabase.WorkflowProvider.Returns(workflowProvider);

            context.ContentDatabase.GetItem(item.ID, Arg.Any<Language>(), Arg.Any<Version>()).Returns(item);

            foreach (WorkflowCommand command in commands)
            {
                var commandItem = Substitute.For<Item>(ID.NewID, ItemData.Empty, Substitute.For<Database>());
                commandItem.Name.Returns(commandItemName);
                context.ContentDatabase.GetItem(command.CommandID, Arg.Any<Language>(), Arg.Any<Version>()).Returns(commandItem);
            }


            var args = HorizonSaveItemArgs.Create();
            args.Items = new[]
            {
                new HorizonArgsSaveItem()
                {
                    ID = item.ID
                }
            };

            //act
            sut.Process(ref args);

            // assert
            foreach (WorkflowCommand command in commands)
            {
                workflow.Received(shouldBeCalled ? 1 : 0).Execute(command.CommandID, item, string.Empty, false);
            }
        }
    }
}
