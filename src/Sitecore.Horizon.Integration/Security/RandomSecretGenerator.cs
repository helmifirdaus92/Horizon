// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using System.Security.Cryptography;

namespace Sitecore.Horizon.Integration.Security
{
    internal class RandomSecretGenerator : IRandomSecretGenerator
    {
        public byte[] GenerateSecret(int minBytesLength = HostVerificationTokenHelper.MinSecretBytesLength)
        {
            using var randomGenerator = RandomNumberGenerator.Create();
            byte[] data = new byte[minBytesLength];
            randomGenerator.GetBytes(data);
            return data;
        }
    }
}
