// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using System.Linq;
using AutoFixture;
using AutoFixture.Xunit2;
using FluentAssertions;
using NSubstitute;
using NSubstitute.ReturnsExtensions;
using Sitecore.Abstractions;
using Sitecore.Data;
using Sitecore.Data.Items;
using Sitecore.ExperienceEditor.Utils;
using Sitecore.Horizon.Integration.ExternalProxy;
using Sitecore.Horizon.Integration.Items.Workflow;
using Sitecore.Horizon.Integration.Pipelines;
using Sitecore.Horizon.Integration.Pipelines.GetItemLayoutDataSources;
using Sitecore.Horizon.Integration.Tests.Unit.AutoFixture;
using Sitecore.Horizon.Tests.Unit.Shared;
using Sitecore.Horizon.Tests.Unit.Shared.Extensions;
using Sitecore.NSubstituteUtils;
using Sitecore.Security.AccessControl;
using Sitecore.Security.Accounts;
using Sitecore.Workflows;
using Sitecore.Workflows.Simple;
using Xunit;

namespace Sitecore.Horizon.Integration.Tests.Unit.Items.Workflow
{
    public class HorizonWorkflowManagerTests
    {
        [Theory]
        [AutoNData]
        internal void GetItemWorkflowInfo_ShouldReturnStateAndCommands(
            [Frozen] IWorkflowFilterer filterer,
            HorizonWorkflowManager sut,
            FakeItem fakeItem,
            Item stateIdItem,
            IWorkflow workflow,
            WorkflowState workflowState,
            IWorkflowProvider workflowProvider)
        {
            //arrange
            fakeItem.WithItemLocking();
            fakeItem.WithItemAccess();

            Item item = fakeItem.ToSitecoreItem();

            workflowProvider.GetWorkflow(item).Returns(workflow);
            item.Database.WorkflowProvider.Returns(workflowProvider);

            var commands = new[]
            {
                new WorkflowCommand("command1", "displayName1", "icon", false),
                new WorkflowCommand("command2", "displayName2", "icon", false),
                new WorkflowCommand("command3", "displayName3", "icon", false),
            };

            workflow.GetCommands(item).Returns(commands);
            workflow.GetState(item).Returns(workflowState);
            stateIdItem.Database.GetItem(workflowState.StateID).Returns(stateIdItem);

            filterer.FilterVisibleCommands(commands, item, item.Database).Returns(commands);

            // act
            var result = sut.GetItemWorkflowInfo(item);

            // assert
            result.Should().NotBeNull();
            result.Commands.Count.Should().Be(commands.Length);
            result.Commands.Select(command => command.DisplayName).Should().BeEquivalentTo(commands.Select(command => command.DisplayName));
            result.Commands.Select(command => command.Icon).Should().BeEquivalentTo(commands.Select(command => command.Icon));
            result.State.Should().Be(workflowState);
        }

        [Theory]
        [AutoNData]
        internal void GetItemWorkflowInfo_ShouldReturnNullIfNoDbWorkflowProvider(
            [Frozen] ISitecoreContext scContext,
            HorizonWorkflowManager sut,
            Item item)
        {
            // arrange
            scContext.Database.WorkflowProvider.ReturnsNull();

            // act
            var result = sut.GetItemWorkflowInfo(item);

            // assert
            result.Should().BeNull();
        }

        [Theory]
        [AutoNData]
        internal void GetItemWorkflowInfo_ShouldReturnNullIfNoItemWorkflow(
            [Frozen] IWorkflowProvider workflowProvider,
            HorizonWorkflowManager sut,
            Database database,
            Item item)
        {
            // arrange
            database.WorkflowProvider.Returns(workflowProvider);
            workflowProvider.GetWorkflow(item).ReturnsNull();

            // act
            var result = sut.GetItemWorkflowInfo(item);

            // assert
            result.Should().BeNull();
        }

        [Theory]
        [InlineAutoNData(false, true, true, true, true, null)]
        [InlineAutoNData(true, true, true, true, false, WorkflowErrorCode.ItemLockedByAnotherUser)]
        [InlineAutoNData(false, false, true, true, false, WorkflowErrorCode.NoAccessRightItemWrite)]
        [InlineAutoNData(false, false, false, true, false, WorkflowErrorCode.NoAccessRightWorkflowWrite)]
        internal void GetItemWorkflowInfo_ShouldReturnCanEditCorrectly(bool isLocked, bool canWrite, bool hasWorkflowWrite, bool hasWorkflowExecute, bool shouldEdit, WorkflowErrorCode errorCode,
            [Frozen] BaseAccessRightManager accessRightManager,
            [Frozen] BaseAuthorizationManager authorizationManager,
            [Frozen] ISitecoreContext scContext,
            [Frozen] BaseTranslate translate,
            HorizonWorkflowManager sut,
            Item item,
            IWorkflowProvider workflowProvider,
            IWorkflow workflow,
            Item workflowStateItem,
            AccessRight stateWriteRight)
        {
            //arrange
            item.AsFake()
                .WithItemLocking()
                .WithItemAccess();

            item.Locking.IsLocked().Returns(isLocked);
            item.Locking.HasLock().Returns(false);
            item.Access.CanWrite().Returns(canWrite);

            accessRightManager.GetAccessRight(WellknownRights.WorkflowStateWrite).Returns(stateWriteRight);

            item.Database.WorkflowProvider.Returns(workflowProvider);
            workflowProvider.GetWorkflow(item).Returns(workflow);
            workflow.GetState(item).Returns(new WorkflowState(workflowStateItem.ID.ToString(), "stateName", "icon", finalState: false));
            authorizationManager.IsAllowed(workflowStateItem, stateWriteRight, Any.Arg<User>()).Returns(hasWorkflowWrite);

            translate.Text(Any.String).Returns(call => call.Arg<string>());
            translate.Text(Any.String, Any.String).Returns(call => string.Format(call.ArgAt<string>(0), call.ArgAt<object[]>(1)));

            scContext.User.IsAdministrator.Returns(false);

            // act
            var result = sut.GetItemWorkflowInfo(item);

            // assert
            result.CanEdit.Should().Be(shouldEdit);
            result.Warnings.FirstOrDefault()?.ErrorCode.Should().Be(errorCode);
        }

        [Theory]
        [InlineAutoNData(3, false, false, true)]
        [InlineAutoNData(3, true, false, true)]
        [InlineAutoNData(3, false, true, true)]
        [InlineAutoNData(0, false, false, false)]
        [InlineAutoNData(0, true, false, true)]
        [InlineAutoNData(0, false, true, true)]
        internal void GetItemWorkflowInfo_ShouldReturnPermissionsWarning(int cmdCount, bool isFinal, bool isAdministrator, bool canExecute,
            [Frozen] ISitecoreContext scContext,
            [Frozen] BaseTranslate translate,
            [Frozen] IWorkflowFilterer workflowFilterer,
            HorizonWorkflowManager sut,
            Item item,
            Item workflowStateItem,
            IWorkflowProvider workflowProvider,
            IWorkflow workflow,
            Generator<WorkflowCommand> commandsGen)
        {
            // arrange
            item.AsFake()
                .WithItemLocking()
                .WithItemAccess();

            item.Locking.IsLocked().Returns(false);
            item.Access.CanWrite().Returns(true);

            translate.Text(Any.String).Returns(call => call.Arg<string>());

            scContext.User.IsAdministrator.Returns(isAdministrator);

            item.Database.WorkflowProvider.Returns(workflowProvider);
            workflowProvider.GetWorkflow(item).Returns(workflow);

            var workflowState = new WorkflowState(workflowStateItem.ID.ToString(), workflowStateItem.Name, "icon", finalState: isFinal);
            workflow.GetState(item).Returns(workflowState);

            workflow.GetCommands(item).Returns(commandsGen.Take(cmdCount).ToArray());
            workflowFilterer.FilterVisibleCommands(Any.Arg<WorkflowCommand[]>(), Any.Item, Any.Arg<Database>()).Returns(c => c.Arg<WorkflowCommand[]>());

            // act
            var result = sut.GetItemWorkflowInfo(item);

            // assert
            result.CanEdit.Should().Be(canExecute);
            result.Warnings.FirstOrDefault()?.ErrorCode.Should().Be(canExecute ? (object)null : WorkflowErrorCode.NoAccessRightWorkflowCommandExecute);
        }

        [Theory]
        [AutoNData]
        internal void ExecuteCommand_ShouldExecuteCorrectCommand(
            [Frozen] IHorizonItemUtil itemUtil,
            [Frozen] BaseAuthorizationManager authorizationManager,
            HorizonWorkflowManager sut,
            Item item,
            IWorkflow workflow,
            Item workflowStateItem,
            Item workflowCommandItem,
            IWorkflowProvider workflowProvider,
            Generator<Item> itemGenerator)
        {
            // arrange
            var successWorkflowResult = new WorkflowResult(true);
            var datasources = itemGenerator.Take(3).ToArray();

            item.AsFake().WithItemLocking().WithItemAccess();
            item.Locking.IsLocked().Returns(false);
            item.Access.CanWrite().Returns(true);

            var command = new WorkflowCommand(workflowCommandItem.ID.ToString(), "displayName1", "icon", false);

            authorizationManager.IsAllowed(Any.Arg<ISecurable>(), Any.Arg<AccessRight>(), Any.Arg<Account>()).ReturnsTrue();

            var workflowState = new WorkflowState(workflowStateItem.ID.ToString(), workflowStateItem.Name, "icon", false);
            workflow.GetState(Any.Arg<Item>()).Returns(workflowState);
            workflow.Execute(Any.String, Any.Arg<Item>(), Any.String, Any.Bool).Returns(successWorkflowResult);
            workflow.GetCommands(item).Returns(new[]
            {
                command
            });

            workflowProvider.GetWorkflow(item).Returns(workflow);
            item.Database.WorkflowProvider.Returns(workflowProvider);
            
            itemUtil.GetDefaultDatasources(Any.Arg<Item>(), Any.Arg<DeviceItem>()).Returns(datasources);
            itemUtil.GetPersonalizedDatasources(Any.Arg<Item>(), Any.Arg<DeviceItem>()).Returns(new Item[]{});

            // act
            sut.ExecuteCommand(command.CommandID, comment: null, item);

            // assert
            workflow.Received(1).Execute(command.CommandID, item, Any.String, false);
            foreach (var d in datasources)
            {
                workflow.Received(1).Execute(command.CommandID, d, Any.String, false);
            }
        }

        [Theory]
        [AutoNData]
        internal void ExecuteCommand_ShouldCheckForWorkflowProvider(
            HorizonWorkflowManager sut,
            Item item,
            Database database,
            Item commandItem,
            string comment)
        {
            // arrange
            database.WorkflowProvider.ReturnsNull();

            // act & assert
            sut.Invoking(s => s.ExecuteCommand(commandItem.ID.ToString(), comment, item))
                .Should().Throw<WorkflowCommandException>().WithMessage(Texts.THE_ITEM_IS_CURRENTLY_NOT_PART_OF_A_WORKFLOW);
        }

        [Theory]
        [AutoNData]
        internal void ExecuteCommand_ShouldCheckForWorkflow(
            HorizonWorkflowManager sut,
            Database database,
            IWorkflowProvider workflowProvider,
            Item item,
            Item commandItem,
            string comment)
        {
            // arrange
            workflowProvider.GetWorkflow(item).ReturnsNull();
            database.WorkflowProvider.Returns(workflowProvider);

            // act & assert
            sut.Invoking(s => s.ExecuteCommand(commandItem.ID.ToString(), comment, item))
                .Should().Throw<WorkflowCommandException>().WithMessage(Texts.THE_ITEM_IS_CURRENTLY_NOT_PART_OF_A_WORKFLOW);
        }

        [Theory]
        [AutoNData]
        internal void ExecuteCommand_ShouldGetValidationFromActionRecords(
            [Frozen] BaseAuthorizationManager authorizationManager,
            HorizonWorkflowManager sut,
            IWorkflow workflow,
            Item workflowStateItem,
            Item workflowCommandItem,
            IWorkflowProvider workflowProvider,
            [Frozen] Item item,
            ItemValidationActionRecord itemValidationActionRecord,
            FieldValidationActionRecord fieldValidationActionRecord)
        {
            // arrange
            var successWorkflowResult = new WorkflowResult(true, "", ID.NewID, true, new BaseWorkflowActionRecord[] { itemValidationActionRecord, fieldValidationActionRecord });

            item.AsFake().WithItemLocking().WithItemAccess();
            item.Locking.IsLocked().Returns(false);
            item.Access.CanWrite().Returns(true);

            var command = new WorkflowCommand(workflowCommandItem.ID.ToString(), "displayName1", "icon", false);

            authorizationManager.IsAllowed(Any.Arg<ISecurable>(), Any.Arg<AccessRight>(), Any.Arg<Account>()).ReturnsTrue();

            var workflowState = new WorkflowState(workflowStateItem.ID.ToString(), workflowStateItem.Name, "icon", false);
            workflow.GetState(Any.Arg<Item>()).Returns(workflowState);
            workflow.Execute(Any.String, Any.Arg<Item>(), Any.String, Any.Bool).Returns(successWorkflowResult);
            workflow.GetCommands(item).Returns(new[]
            {
                command
            });

            workflowProvider.GetWorkflow(item).Returns(workflow);
            item.Database.WorkflowProvider.Returns(workflowProvider);

            // act
            var result = sut.ExecuteCommand(command.CommandID, comment: null, item);

            // assert
            result.ValidationResult.PageItemResult.ItemId.Should().Be(item.ID);
            result.ValidationResult.PageItemResult.ItemName.Should().Be(item.DisplayName);
            result.ValidationResult.PageItemResult.ItemRulesResult[0].Should().Match<ValidationRecord>(
                x => x.ValidatorResult == itemValidationActionRecord.ValidationResult.Result.ToString()
                    && x.ValidatorText == itemValidationActionRecord.ValidationResult.Text);
            result.ValidationResult.PageItemResult.FieldRulesResult[0].Records[0].Should().Match<ValidationRecord>(
                x => x.ValidatorResult == fieldValidationActionRecord.ValidationResult.Result.ToString()
                    && x.ValidatorText == fieldValidationActionRecord.ValidationResult.Text);
        }
    }
}
