// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Threading;

namespace Sitecore.Horizon.Integration.GraphQL.Tests.Helpers;

public static class Extensions
{
    public static void WaitForCondition<T>(
        this T obj,
        Func<T, bool> condition,
        TimeSpan timeout,
        int pollInterval = 200,
        bool failOnFalse = false,
        string message = null)
    {
        Exception exception = null;
        bool flag = false;
        Func<T, bool> func = parameter =>
        {
            try
            {
                return condition(parameter);
            }
            catch (Exception ex)
            {
                exception = ex;
                if (!failOnFalse || !(ex is TimeoutException))
                {
                    return false;
                }

                throw;
            }
        };

        Stopwatch stopwatch = Stopwatch.StartNew();
        while (stopwatch.Elapsed < timeout)
        {
            if (func(obj))
            {
                flag = true;
                break;
            }

            Thread.Sleep(pollInterval);
        }

        if (flag)
        {
            return;
        }

        IEnumerable<StackFrame> source = new StackTrace(true).GetFrames();
        IEnumerable<int> lineNumbers = source.Select(frm => frm.GetFileLineNumber());
        string stackTrace = string.Join("\n\t", source
            .Select(frm => frm.GetMethod())
            .Select(m => $"{m.ReflectedType.Name}.{m.Name}")
            .Zip(lineNumbers, (method, line) => $"{method}:line {line}")
            .Where(line => !line.EndsWith("line 0")));

        if (message == null)
        {
            message = $"Condition was not true after timeout: {timeout.TotalMilliseconds} ms. \n\t{stackTrace}";
        }

        Console.WriteLine("WARNING: " + message);
        if (failOnFalse)
        {
            message += exception != null ? "\nNested exception:\n" + exception.ToString() : string.Empty;
            throw new TimeoutException(message);
        }
    }

    public static string GetRandomName()
    {
        var random = new Random();
        var uniqNumber = random.Next(10000, 99999).ToString();
        return "Test page " + uniqNumber;
    }
}
