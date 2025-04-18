// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using System.Collections.Generic;
using System.Linq;
using Sitecore.Horizon.Integration.Tests.Ui.ApiHelpers.Data;
using UTF.HelperWebService;

namespace Sitecore.Horizon.Integration.Tests.Ui.ApiHelpers.HelperClasses.Security
{
    public class SecurityOperations : ISecurityOperations
    {
        public SecurityOperations(HelperService helper)
        {
            Helper = helper;
            Users = new List<User>();
        }

        private HelperService Helper { get; }
        private List<User> Users { get; }

        public User CreateHorizonUserWithEditRights(string userName, string password)
        {
            var roles = new[]
            {
                "sitecore\\Author",
                "sitecore\\Designer",
                "sitecore\\Sitecore Client Advanced Publishing"
            };
            var user = CreateUserWithRoles(userName, roles, password);
            var rights = new[]
            {
                UTF.HelperWebService.SecurityRight.Write,
                UTF.HelperWebService.SecurityRight.Rename,
                UTF.HelperWebService.SecurityRight.Create,
                UTF.HelperWebService.SecurityRight.Delete
            };

            foreach (var right in rights)
            {
                Helper.SetSecurityRight(Database.Master, DefaultScData.GenericItems.ContentItemPath, user.FullUserName, right, AccessPermission.Allow);
            }

            return user;
        }


        public User CreateHorizonUser(string username)
        {
            var roles = new[]
            {
                //TODO: replace with Horizon user role
                "sitecore\\author"
            };

            User user = Users.FirstOrDefault(u => u.FullUserName == username);

            if (user == null)
            {
                user = CreateUserWithRoles(username, roles);
            }
            else
            {
                AssignRolesToUser(user, roles);
            }

            return user;
        }

        public User CreateUserWithRoles(string username, string[] roles, string password = "Password")
        {
            (string localName, string fullUserName) = ParseUserName(username);

            string email = $"{localName}@sitecore.net";

            if (Helper.UserOrRoleExists(username, true))
            {
                Helper.DeleteUserOrRole(username, true);
            }

            Helper.CreateUser(fullUserName, password, roles, email);

            var user = new User(fullUserName, password, roles);

            Users.Add(user);

            return user;
        }

        public void DeleteUsers()
        {
            foreach (User user in Users)
            {
                Helper.DeleteUserOrRole(user.FullUserName, true);
            }

            Users.Clear();
        }

        public void AssignRolesToUser(User user, string[] roles)
        {
            string[] newRoles = roles.Except(user.Roles).ToArray();

            Helper.AddUserToRoles(user.FullUserName, newRoles);
        }

        private (string localName, string fullUserName) ParseUserName(string userName)
        {
            if (userName.Contains(@"\"))
            {
                return (localName: userName.Split('\\').Last(), fullUserName: userName);
            }

            return (localName: userName, fullUserName: $@"sitecore\{userName}");
        }
    }
}
