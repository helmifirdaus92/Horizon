// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.


namespace Sitecore.Horizon.Integration.Security
{
    internal interface ITokenGenerator
    {
        string GenerateToken(string input, byte[] secret);
    }
}
