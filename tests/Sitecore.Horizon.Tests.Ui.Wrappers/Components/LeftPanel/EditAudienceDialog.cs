// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using UTF;

namespace Sitecore.Horizon.Integration.Tests.Ui.Wrappers.Components.LeftPanel
{
    public class EditAudienceDialog
    {
        private readonly WebElement _editAudienceDialog;

        public EditAudienceDialog(WebElement editAudienceDialog)
        {
            _editAudienceDialog = editAudienceDialog;
        }

        public string HeaderText => _editAudienceDialog.FindElement("ng-spd-dialog-header").Text;

        private WebElement _audienceInout => _editAudienceDialog.FindElement("label[for=audience-name] + input");

        private WebElement _saveAudienceButton => _editAudienceDialog.FindElement(".disconnected + button");

        public void SetAudienceName(string audienceName)
        {
            _audienceInout.TypeKeys(audienceName);
            _saveAudienceButton.Click();
            _editAudienceDialog.Driver.WaitForHorizonIsStable();
        }
    }
}
