// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

namespace Sitecore.Horizon.Integration.Tests.Ui.ApiHelpers.HelperClasses.Security
{
    public interface ISecurityOperations
    {
        User CreateHorizonUser(string username);

        User CreateHorizonUserWithEditRights(string userName, string password);

        User CreateUserWithRoles(string username, string[] roles, string password = "Password");

        void DeleteUsers();

        void AssignRolesToUser(User user, string[] roles);
    }
}
