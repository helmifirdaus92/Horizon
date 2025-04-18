// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using System;
using Sitecore.Abstractions;
using Sitecore.Horizon.Integration.Configuration;
using Sitecore.Horizon.Integration.ExternalProxy;

namespace Sitecore.Horizon.Integration.Security
{
    internal class HostVerificationTokenHelper : IHostVerificationTokenHelper
    {
        public const int MinSecretBytesLength = 64;
        private readonly byte[] _tokenSecret;
        private readonly ITokenGenerator _tokenGenerator;
        private readonly BaseSettings _settings;
        private readonly ISitecoreContext _context;
        private readonly BaseLog _logger;
        private readonly IRandomSecretGenerator _randomSecretGenerator;

        public HostVerificationTokenHelper(
            ISitecoreContext context,
            BaseSettings settings,
            ITokenGenerator tokenGenerator,
            BaseLog logger,
            IRandomSecretGenerator randomSecretGenerator
        )
        {
            _context = context ?? throw new ArgumentNullException(nameof(context));
            _settings = settings ?? throw new ArgumentNullException(nameof(settings));
            _tokenGenerator = tokenGenerator ?? throw new ArgumentNullException(nameof(tokenGenerator));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
            _randomSecretGenerator = randomSecretGenerator ?? throw new ArgumentNullException(nameof(randomSecretGenerator));

            _tokenSecret = GetTokenSecret();

            byte[] GetTokenSecret()
            {
                string configuredSecret = _settings.Horizon().ClientHostSecret;
                return IsConfiguredSecretValid(configuredSecret)
                    ? System.Convert.FromBase64String(configuredSecret)
                    : _randomSecretGenerator.GenerateSecret();
            }
        }

        public string BuildHostVerificationToken()
        {
            var userKeyObj = _context.User.GetProviderUserKey();
            if (userKeyObj == null)
            {
                return "";
            }

            var userIdentifier = userKeyObj.ToString();
            return _tokenGenerator.GenerateToken(userIdentifier, _tokenSecret);
        }

        private bool IsConfiguredSecretValid(string configuredSecret)
        {
            var isValid = false;
            try
            {
                isValid = !string.IsNullOrEmpty(configuredSecret) &&
                    System.Convert.FromBase64String(configuredSecret).Length >= MinSecretBytesLength;

                if (!isValid)
                {
                    _logger.Warn($"Unable to find valid Horizon ClientHostSecret", this);
                }
            }
            catch (FormatException ex)
            {
                _logger.Warn($"Unable to find valid Horizon ClientHostSecret", ex, this);
            }

            return isValid;
        }
    }
}
