// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using System;
using AutoFixture.Idioms;

namespace Sitecore.Horizon.Shared.Tests.Unit.Fixtures
{
    /// <summary>
    /// Temporary brought expectation before the issue is fixed:
    /// https://github.com/AutoFixture/AutoFixture/issues/1107
    /// </summary>
    public class ExtendedNullReferenceBehaviorExpectation : IBehaviorExpectation
    {
        public void Verify(IGuardClauseCommand command)
        {
            if (!command.RequestedType.IsClass && !command.RequestedType.IsInterface)
            {
                return;
            }

            try
            {
                command.Execute(null);
            }
            catch (ArgumentNullException e)
            {
                if (string.Equals(e.ParamName, command.RequestedParameterName, StringComparison.Ordinal))
                {
                    return;
                }

                throw command.CreateException("null", e);
            }
            catch (ArgumentException e)
            {
                if (string.Equals(e.ParamName, command.RequestedParameterName, StringComparison.Ordinal))
                {
                    return;
                }

                throw command.CreateException("null", e);
            }
            catch (Exception e)
            {
                throw command.CreateException("null", e);
            }

            throw command.CreateException("null");
        }
    }
}
