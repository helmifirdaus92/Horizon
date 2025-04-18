// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using OpenQA.Selenium;
using Sitecore.E2E.Test.Framework;
using Sitecore.Pages.E2EFramework.UI.Tests.Wrappers.Controls.Dialog;
using Sitecore.Pages.E2EFramework.UI.Tests.Wrappers.Data;

namespace Sitecore.Pages.E2EFramework.UI.Tests.Wrappers.Components.TopPanel;

public class WorkflowBar : BaseControl
{
    public WorkflowBar(IWebElement container, params object[] parameters) : base(container, parameters)
    {
    }

    public PublishButton PublishButton => new(Container.FindElement("app-publish-button"));

    public string WorkflowState => Container.FindElement("span.workflow-state-badge.mr-md.ng-star-inserted").Text;
    public bool IsWorkFLowDisplayed => Container.CheckElementExists("span.workflow-state-badge");
    public IWebElement _actionsButton => Container.FindElement("#workflowActionsBtn");
    public List<IWebElement> _workflowActions => Container.GetDriver().FindElements("ng-spd-popover ng-spd-list button[role='listitem']").ToList();
    public bool IsActionsButtonDisabled=> _actionsButton.HasAttribute("disabled");

    public List<string> WorkflowActions => _workflowActions.Select(w => w.Text).ToList();

    public WorkflowBar OpenWorkflowActions()
    {
        _actionsButton.Click();
        Container.GetDriver().WaitForHorizonIsStable();
        Container.WaitForCondition(_ => _workflowActions.TrueForAll(wa => wa.Text.Length > 0));
        return this;
    }

    public bool HasPublishButton()
    {
        return Container.FindElements("app-publish-button").Any();
    }

    public bool HasActionsButton()
    {
        return Container.CheckElementExists("#workflowActionsBtn");
    }

    public string GetActionsMessage()
    {
        _actionsButton.WaitForCondition(a=>a.GetParent().GetAttribute("title")!=null);
        return _actionsButton.GetParent().GetAttribute("title");
    }

    public WorkflowConfirmationDialog PerformWorkflowActions(string action)
    {
        _workflowActions.Find(w => w.Text.Equals(action))?.Click();
        Container.GetDriver().WaitForHorizonIsStable();
        return new WorkflowConfirmationDialog(Container.GetDriver().FindElement(Constants.WorkflowConfirmationDialogLocator));
    }
}
