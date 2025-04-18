// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using System.Collections.Generic;
using System.Linq;
using UTF;

namespace Sitecore.Horizon.Integration.Tests.Ui.ApiHelpers.HelperClasses.Security
{
    public class User
    {
        public User(string fullUserName, string password, IEnumerable<string> roles)
        {
            FullUserName = fullUserName;
            Password = password;

            Roles = roles.ToArray();
        }

        public string UserName => FullUserName.Split('@').First();

        public string Domain => FullUserName.Split('@').Last();

        public IReadOnlyCollection<string> Roles { get; }

        public string FullUserName { get; }

        /// <summary>
        /// Full name column in XM CLoud User Manager
        /// Same value is shown in Pages user profile
        /// </summary>
        public string FullName { get; set; }

        public string Password { get; }

        public void SetClientLanguage(string language)
        {
            Context.HelperService.SetUserClientLanguage(FullUserName, language);
        }
    }
}
