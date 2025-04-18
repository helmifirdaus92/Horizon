// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using System;
using AutoFixture.Idioms;

namespace Sitecore.Horizon.Shared.Tests.Unit.Fixtures
{
    /// <summary>
    /// It's here before the PR is merged:
    /// https://github.com/AutoFixture/AutoFixture/pull/1005
    /// </summary>
    public class EmptyStringBehaviorExpectation : IBehaviorExpectation
    {
        public void Verify(IGuardClauseCommand command)
        {
            if (command.RequestedType != typeof(string))
            {
                return;
            }

            try
            {
                command.Execute(string.Empty);
            }
            catch (ArgumentException ex)
            {
                if (string.Equals(ex.ParamName, command.RequestedParameterName, StringComparison.Ordinal))
                {
                    return;
                }

                throw command.CreateException("<empty string>", ex);
            }
            catch (Exception e)
            {
                throw command.CreateException("<empty string>", e);
            }

            throw command.CreateException("<empty string>");
        }
    }
}
