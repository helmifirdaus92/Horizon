// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using Sitecore.Horizon.Integration.Tests.Ui.ApiHelpers.HelperClasses.Security;
using Sitecore.Horizon.Integration.Tests.Ui.ApiHelpers.HorizonEntities;
using UTF.HelperWebService;
using SecurityRight = Sitecore.Horizon.Integration.Tests.Ui.ApiHelpers.HelperClasses.Security.SecurityRight;

namespace Sitecore.Horizon.Integration.Tests.Ui.ApiHelpers.HelperClasses.Items.StandardFields
{
    public class SecuritySection : ISecuritySection
    {
        private readonly HelperService _helperService;
        private readonly string _contextItemId;
        private readonly DatabaseType _contextDatabase;

        public SecuritySection(string contextItemId, DatabaseType contextDatabase, HelperService helperService)
        {
            _helperService = helperService;
            _contextItemId = contextItemId;
            _contextDatabase = contextDatabase;
        }

        public void SetSecurityRight(string userName, SecurityRight right, AccessType accessType = AccessType.Allow)
        {
            if (_helperService.UserOrRoleExists(userName, true))
            {
                _helperService.SetSecurityRight((Database)_contextDatabase, _contextItemId, userName, (UTF.HelperWebService.SecurityRight)right, (AccessPermission)accessType);
            }
        }
    }
}
