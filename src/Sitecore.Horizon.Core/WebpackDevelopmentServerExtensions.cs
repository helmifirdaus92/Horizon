// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Diagnostics.CodeAnalysis;
using System.Globalization;
using System.IO;
using System.Net;
using System.Net.Http;
using System.Net.Sockets;
using System.Runtime.InteropServices;
using System.Text;
using System.Text.RegularExpressions;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.SpaServices;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Logging.Abstractions;

namespace Sitecore.Horizon.Core
{
    /// <summary>
    /// A copy of ReactDevelopmentServerMiddleware which supports listening to https and AngularCliMiddlewareExtensions which support webpack progress for Angular 9.
    /// </summary>
    [ExcludeFromCodeCoverage]
    internal static class WebpackDevelopmentServerExtensions
    {
        private const string LogCategoryName = "Microsoft.AspNetCore.SpaServices";
        private static readonly TimeSpan RegexMatchTimeout = TimeSpan.FromSeconds(5); // This is a development-time only feature, so a very long timeout is fine

        public enum WebpackFramework
        {
            React,
            Angular
        }

        public static void UseWebpackDevelopmentServer(
            this ISpaBuilder spaBuilder,
            string npmScriptName, WebpackFramework webpackFramework = WebpackFramework.React)
        {
            var sourcePath = spaBuilder.Options.SourcePath;
            if (string.IsNullOrEmpty(sourcePath))
            {
                throw new InvalidOperationException("Source path cannot be empty");
            }

            if (string.IsNullOrEmpty(npmScriptName))
            {
                throw new ArgumentException("Cannot be null or empty", nameof(npmScriptName));
            }

            // Start webpack dev server and attach to middleware pipeline
            var appBuilder = spaBuilder.ApplicationBuilder;
            var logger = GetOrCreateLogger(appBuilder, LogCategoryName);
            var portTask = (webpackFramework == WebpackFramework.Angular)
                ? StartAngularCliServerAsync(sourcePath, npmScriptName, logger)
                : StartCreateReactAppServerAsync(sourcePath, npmScriptName, logger);

            // This is the place which diverges from original react dev server middleware.
            // Support both http and https schemas.
            // Hardcode "localhost" as don't expect it to change.
            var targetUriTask = portTask.ContinueWith(
                task => new UriBuilder(task.Result.schema, "localhost", task.Result.port).Uri, TaskScheduler.Default);

            spaBuilder.UseProxyToSpaDevelopmentServer(() =>
            {
                // On each request, we create a separate startup task with its own timeout. That way, even if
                // the first request times out, subsequent requests could still work.
                var timeout = spaBuilder.Options.StartupTimeout;
                return WithTimeout(targetUriTask, timeout,
                    $"The webpack dev server did not start listening for requests " +
                    $"within the timeout period of {timeout.Seconds} seconds. " +
                    $"Check the log output for error information.");
            });
        }

        private static async Task<(string schema, int port)> StartAngularCliServerAsync(
            string sourcePath, string npmScriptName, ILogger logger)
        {
            var portNumber = FindAvailablePort();
            logger.LogInformation($"Starting @angular/cli on port {portNumber}...");

            var npmScriptRunner = new NpmScriptRunner(
                sourcePath, npmScriptName, $"--port {portNumber}", null);
            npmScriptRunner.AttachToLogger(logger);

            Match openBrowserLine;
            using (var stdErrReader = new EventedStreamStringReader(npmScriptRunner.StdErr))
            {
                try
                {
                    openBrowserLine = await npmScriptRunner.StdOut.WaitForMatch(
                        new Regex("open your browser on (http\\S+)", RegexOptions.None, RegexMatchTimeout));
                }
                catch (EndOfStreamException ex)
                {
                    throw new InvalidOperationException(
                        message: $"The NPM script '{npmScriptName}' exited without indicating that the " +
                        $"Angular CLI was listening for requests. The error output was: " +
                        $"{stdErrReader.ReadAsString()}", ex);
                }
            }

            var uri = new Uri(openBrowserLine.Groups[1].Value);

            // Even after the Angular CLI claims to be listening for requests, there's a short
            // period where it will give an error if you make a request too quickly
            await WaitForAngularCliServerToAcceptRequests(uri);
            return (uri.Scheme, uri.Port);
        }

        private static async Task WaitForAngularCliServerToAcceptRequests(Uri cliServerUri)
        {
            // To determine when it's actually ready, try making HEAD requests to '/'. If it
            // produces any HTTP response (even if it's 404) then it's ready. If it rejects the
            // connection then it's not ready. We keep trying forever because this is dev-mode
            // only, and only a single startup attempt will be made, and there's a further level
            // of timeouts enforced on a per-request basis.
            var timeoutMilliseconds = 1000;
            using (var client = new HttpClient())
            {
                while (true)
                {
                    try
                    {
                        using var cts = new CancellationTokenSource(timeoutMilliseconds);

                        // If we get any HTTP response, the CLI server is ready
                        await client.SendAsync(
#pragma warning disable CA2000 // Dispose objects before losing scope - it's not required here.
                            new HttpRequestMessage(HttpMethod.Head, cliServerUri),
#pragma warning restore CA2000 // Dispose objects before losing scope
                            cts.Token);
                        return;
                    }
#pragma warning disable CA1031 // Do not catch general exception types - it's a Dev server and we are fine to just wait.
                    catch
#pragma warning restore CA1031 // Do not catch general exception types
                    {
                        await Task.Delay(500);

                        // Depending on the host's networking configuration, the requests can take a while
                        // to go through, most likely due to the time spent resolving 'localhost'.
                        // Each time we have a failure, allow a bit longer next time (up to a maximum).
                        // This only influences the time until we regard the dev server as 'ready', so it
                        // doesn't affect the runtime perf (even in dev mode) once the first connection is made.
                        // Resolves https://github.com/aspnet/JavaScriptServices/issues/1611
                        if (timeoutMilliseconds < 10000)
                        {
                            timeoutMilliseconds += 3000;
                        }
                    }
                }
            }
        }

        private static async Task<(string schema, int port)> StartCreateReactAppServerAsync(
            string sourcePath, string npmScriptName, ILogger logger)
        {
            var portNumber = FindAvailablePort();
            logger.LogInformation($"Starting webpack server on port {portNumber}...");

            var envVars = new Dictionary<string, string>
            {
                {
                    "PORT", portNumber.ToString(CultureInfo.InvariantCulture)
                }
            };
            var npmScriptRunner = new NpmScriptRunner(
                sourcePath, npmScriptName, null, envVars);
            npmScriptRunner.AttachToLogger(logger);

            using (var stdErrReader = new EventedStreamStringReader(npmScriptRunner.StdErr))
            {
                try
                {
                    // Get the port and schema from URL so that we transparently support both HTTP and HTTPS.
                    var match = await npmScriptRunner.StdOut.WaitForMatch(
                        new Regex("Project is running at (http|https)://localhost:(\\d+)/", RegexOptions.None, RegexMatchTimeout));

                    return (match.Groups[1].Value, int.Parse(match.Groups[2].Value, CultureInfo.InvariantCulture));
                }
                catch (EndOfStreamException ex)
                {
                    throw new InvalidOperationException(
                        $"The NPM script '{npmScriptName}' exited without indicating that the " +
                        $"webpack dev server was listening for requests. The error output was: " +
                        $"{stdErrReader.ReadAsString()}", ex);
                }
            }
        }

        private static int FindAvailablePort()
        {
            var listener = new TcpListener(IPAddress.Loopback, 0);
            listener.Start();
            try
            {
                return ((IPEndPoint)listener.LocalEndpoint).Port;
            }
            finally
            {
                listener.Stop();
            }
        }

        private static ILogger GetOrCreateLogger(
            IApplicationBuilder appBuilder,
            string logCategoryName)
        {
            // If the DI system gives us a logger, use it. Otherwise, set up a default one.
            var loggerFactory = appBuilder.ApplicationServices.GetService<ILoggerFactory>();
            var logger = loggerFactory != null
                ? loggerFactory.CreateLogger(logCategoryName)
                : NullLogger.Instance;
            return logger;
        }

        private static async Task<T> WithTimeout<T>(Task<T> task, TimeSpan timeoutDelay, string message)
        {
            if (task == await Task.WhenAny(task, Task.Delay(timeoutDelay)))
            {
                return task.Result;
            }
            else
            {
                throw new TimeoutException(message);
            }
        }

        private class EventedStreamStringReader : IDisposable
        {
            private EventedStreamReader _eventedStreamReader;
            private bool _isDisposed;
            private StringBuilder _stringBuilder = new StringBuilder();

            public EventedStreamStringReader(EventedStreamReader eventedStreamReader)
            {
                _eventedStreamReader = eventedStreamReader
                    ?? throw new ArgumentNullException(nameof(eventedStreamReader));
                _eventedStreamReader.OnReceivedLine += OnReceivedLine;
            }

            public string ReadAsString() => _stringBuilder.ToString();

            public void Dispose()
            {
                if (!_isDisposed)
                {
                    _eventedStreamReader.OnReceivedLine -= OnReceivedLine;
                    _isDisposed = true;
                }
            }

            private void OnReceivedLine(string line) => _stringBuilder.AppendLine(line);
        }

        private class EventedStreamReader
        {
            private readonly StreamReader _streamReader;
            private readonly StringBuilder _linesBuffer;

            public EventedStreamReader(StreamReader streamReader)
            {
                _streamReader = streamReader ?? throw new ArgumentNullException(nameof(streamReader));
                _linesBuffer = new StringBuilder();
                Task.Factory.StartNew(Run, CancellationToken.None, TaskCreationOptions.None, TaskScheduler.Default);
            }

            public delegate void OnReceivedChunkEventHandler(ArraySegment<char> chunk);

            public delegate void OnReceivedLineEventHandler(string line);

            public delegate void OnStreamClosedEventHandler();

            public event OnReceivedChunkEventHandler? OnReceivedChunk;
            public event OnReceivedLineEventHandler? OnReceivedLine;
            public event OnStreamClosedEventHandler? OnStreamClosed;

            public Task<Match> WaitForMatch(Regex regex)
            {
                var tcs = new TaskCompletionSource<Match>();
                var completionLock = new object();

                OnReceivedLineEventHandler? onReceivedLineHandler = null;
                OnStreamClosedEventHandler? onStreamClosedHandler = null;

                void ResolveIfStillPending(Action applyResolution)
                {
                    lock (completionLock)
                    {
                        if (!tcs.Task.IsCompleted)
                        {
                            OnReceivedLine -= onReceivedLineHandler;
                            OnStreamClosed -= onStreamClosedHandler;
                            applyResolution();
                        }
                    }
                }

                onReceivedLineHandler = line =>
                {
                    var match = regex.Match(line);
                    if (match.Success)
                    {
                        ResolveIfStillPending(() => tcs.SetResult(match));
                    }
                };

                onStreamClosedHandler = () => { ResolveIfStillPending(() => tcs.SetException(new EndOfStreamException())); };

                OnReceivedLine += onReceivedLineHandler;
                OnStreamClosed += onStreamClosedHandler;

                return tcs.Task;
            }

            private async Task Run()
            {
                var buf = new char[8 * 1024];
                while (true)
                {
                    var chunkLength = await _streamReader.ReadAsync(buf, 0, buf.Length);
                    if (chunkLength == 0)
                    {
                        if (_linesBuffer.Length > 0)
                        {
                            OnCompleteLine(_linesBuffer.ToString());
                            _linesBuffer.Clear();
                        }

                        OnClosed();
                        break;
                    }

                    OnChunk(new ArraySegment<char>(buf, 0, chunkLength));

                    int lineBreakPos = -1;
                    int startPos = 0;

                    // get all the newlines
                    while ((lineBreakPos = Array.IndexOf(buf, '\n', startPos, chunkLength - startPos)) >= 0 && startPos < chunkLength)
                    {
                        var length = (lineBreakPos + 1) - startPos;
                        _linesBuffer.Append(buf, startPos, length);
                        OnCompleteLine(_linesBuffer.ToString());
                        _linesBuffer.Clear();
                        startPos = lineBreakPos + 1;
                    }

                    // get the rest
                    if (lineBreakPos < 0 && startPos < chunkLength)
                    {
                        _linesBuffer.Append(buf, startPos, chunkLength);
                    }
                }
            }

            private void OnChunk(ArraySegment<char> chunk)
            {
                var dlg = OnReceivedChunk;
                dlg?.Invoke(chunk);
            }

            private void OnCompleteLine(string line)
            {
                var dlg = OnReceivedLine;
                dlg?.Invoke(line);
            }

            private void OnClosed()
            {
                var dlg = OnStreamClosed;
                dlg?.Invoke();
            }
        }

        private class NpmScriptRunner
        {
            private static Regex AnsiColorRegex = new Regex("\x001b\\[[0-9;]*m", RegexOptions.None, TimeSpan.FromSeconds(1));

            public NpmScriptRunner(string workingDirectory, string scriptName, string? arguments, IDictionary<string, string>? envVars)
            {
                var npmExe = "npm";
                var completeArguments = $"run {scriptName} -- {arguments ?? string.Empty}";
                if (RuntimeInformation.IsOSPlatform(OSPlatform.Windows))
                {
                    // On Windows, the NPM executable is a .cmd file, so it can't be executed
                    // directly (except with UseShellExecute=true, but that's no good, because
                    // it prevents capturing stdio). So we need to invoke it via "cmd /c".
                    npmExe = "cmd";
                    completeArguments = $"/c npm {completeArguments}";
                }

                var processStartInfo = new ProcessStartInfo(npmExe)
                {
                    Arguments = completeArguments,
                    UseShellExecute = false,
                    RedirectStandardInput = true,
                    RedirectStandardOutput = true,
                    RedirectStandardError = true,
                    WorkingDirectory = workingDirectory
                };

                if (envVars != null)
                {
                    foreach (var keyValuePair in envVars)
                    {
                        processStartInfo.Environment[keyValuePair.Key] = keyValuePair.Value;
                    }
                }

                var process = LaunchNodeProcess(processStartInfo);
                StdOut = new EventedStreamReader(process.StandardOutput);
                StdErr = new EventedStreamReader(process.StandardError);
            }

            public EventedStreamReader StdOut { get; }
            public EventedStreamReader StdErr { get; }

            public void AttachToLogger(ILogger logger)
            {
                // When the NPM task emits complete lines, pass them through to the real logger
                StdOut.OnReceivedLine += line =>
                {
                    if (!string.IsNullOrWhiteSpace(line))
                    {
                        // NPM tasks commonly emit ANSI colors, but it wouldn't make sense to forward
                        // those to loggers (because a logger isn't necessarily any kind of terminal)
                        logger.LogInformation(StripAnsiColors(line));
                    }
                };

                StdErr.OnReceivedLine += line =>
                {
                    if (!string.IsNullOrWhiteSpace(line))
                    {
                        string stripLine = StripAnsiColors(line);

                        if (stripLine.Contains("[webpack.Progress]", StringComparison.OrdinalIgnoreCase))
                        {
                            // Angular 9 output progress information as diagnostic information into stdErr, however, we mark it as Information
                            logger.LogInformation(stripLine);
                        }
                        else
                        {
                            logger.LogError(stripLine);
                        }
                    }
                };

                // But when it emits incomplete lines, assume this is progress information and
                // hence just pass it through to StdOut regardless of logger config.
                StdErr.OnReceivedChunk += chunk =>
                {
                    var containsNewline = Array.IndexOf(
                        chunk.Array!, '\n', chunk.Offset, chunk.Count) >= 0;
                    if (!containsNewline)
                    {
                        Console.Write(chunk.Array!, chunk.Offset, chunk.Count);
                    }
                };
            }

            private static string StripAnsiColors(string line)
                => AnsiColorRegex.Replace(line, string.Empty);

            private static Process LaunchNodeProcess(ProcessStartInfo startInfo)
            {
                try
                {
                    var process = Process.Start(startInfo);

                    // See equivalent comment in OutOfProcessNodeInstance.cs for why
#pragma warning disable CS8602 // Dereference of a possibly null reference.
                    process.EnableRaisingEvents = true;
#pragma warning restore CS8602 // Dereference of a possibly null reference.

                    return process;
                }
                catch (Exception ex)
                {
                    var message = $"Failed to start 'npm'. To resolve this:.\n\n"
                        + "[1] Ensure that 'npm' is installed and can be found in one of the PATH directories.\n"
                        + $"    Current PATH enviroment variable is: {Environment.GetEnvironmentVariable("PATH")}\n"
                        + "    Make sure the executable is in one of those directories, or update your PATH.\n\n"
                        + "[2] See the InnerException for further details of the cause.";
                    throw new InvalidOperationException(message, ex);
                }
            }
        }
    }
}
