// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using System.Security.Cryptography;
using System.Text;
using Sitecore.Diagnostics;

namespace Sitecore.Horizon.Integration.Security
{
    internal class TokenGenerator : ITokenGenerator
    {
        public string GenerateToken(string input, byte[] secret)
        {
            Assert.ArgumentNotNullOrEmpty(input, nameof(input));
            Assert.ArgumentNotNull(secret, nameof(secret));

            string base64Hash;
            using (HMAC hmac = new HMACSHA256(secret))
            {
                hmac.ComputeHash(Encoding.UTF8.GetBytes(input));

                base64Hash = System.Convert.ToBase64String(hmac.Hash);
            }

            return base64Hash;
        }
    }
}
