// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using System;
using GraphQL;
using Sitecore.Exceptions;

namespace Sitecore.Horizon.Integration.GraphQL.DependencyInjection
{
    internal class ServiceProviderDependencyResolver : IDependencyResolver
    {
        private readonly IServiceProvider _serviceProvider;

        public ServiceProviderDependencyResolver(IServiceProvider serviceProvider)
        {
            _serviceProvider = serviceProvider ?? throw new ArgumentNullException(nameof(serviceProvider));
        }

        public T Resolve<T>() => (T) Resolve(typeof(T));

        public object Resolve(Type type)
        {
            if (type == null)
            {
                throw new ArgumentNullException(nameof(type));
            }

            var spValue = _serviceProvider.GetService(type);
            if (spValue == null)
            {
                throw new ConfigurationException($"Type is not registered in DI container: ${type.FullName}");
            }

            return spValue;
        }
    }
}
