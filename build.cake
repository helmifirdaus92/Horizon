//////////////////////////////////////////////////////////////////////
// ADDINS
//////////////////////////////////////////////////////////////////////

#addin nuget:?package=Cake.Powershell&version=1.0.1

//////////////////////////////////////////////////////////////////////
// MODULES
//////////////////////////////////////////////////////////////////////


//////////////////////////////////////////////////////////////////////
// DIRECTIVES
//////////////////////////////////////////////////////////////////////

#load nuget:?package=Sitecore.Brew
#load nuget:?package=Sitecore.Brew.DefaultConfiguration

#load brewplugin:?name=simpleversion
#load brewplugin:?name=npm
#load brewplugin:?name=copyrightchecker
#load brewplugin:?name=dotnetcore
#load brewplugin:?name=codeanalysis
#load brewplugin:?name=codesigning
#load brewplugin:?name=ziparchive
#load brewplugin:?name=nvm
#load brewplugin:?name=nuget

// Added by Horizon to parse semver
#addin nuget:?package=Cake.SemVer
#addin nuget:?package=semver&version=2.0.4

//////////////////////////////////////////////////////////////////////
// TOOLS
//////////////////////////////////////////////////////////////////////

#tool "nuget:?package=ApiCheck&version=0.1.20"

//////////////////////////////////////////////////////////////////////
// ARGUMENTS
//////////////////////////////////////////////////////////////////////

var target = Argument("target", "Gate");
var skipHFIPacking = Argument("skiphfipacking" , false);

//////////////////////////////////////////////////////////////////////
// VARIABLES
//////////////////////////////////////////////////////////////////////

var isHFIPacked = true;
var latestHFIVersion = "";

//////////////////////////////////////////////////////////////////////
// TASK TARGETS
//////////////////////////////////////////////////////////////////////

Task("TagBuild")
    .IsDependentOn(DefaultBuild.Tasks.TagBuild)
    .Does(() => { });

Task("Gate")
   .IsDependentOn(DefaultBuild.EntryPoints.FinalBuildStep)
   .Does(() => { });

//////////////////////////////////////////////////////////////////////
// HORIZON CUSTOM TASK TARGETS
//////////////////////////////////////////////////////////////////////

Task("Horizon-NPM-RegisterPrivateFeed")
    .IsDependeeOf(DotNetCorePlugin.Tasks.PreCleanRestore)
    .Description("Register private feeds")
    .Does(() => {
        var cloudSmithApiToken = Environment.GetEnvironmentVariable("CloudSmithApiToken", EnvironmentVariableTarget.Process);

        if (string.IsNullOrEmpty(cloudSmithApiToken)){
            Information("Could not find the api key for cloud smith api Token.");
            return;
        }

        Information($"Start restore cloud smith npm packages = {cloudSmithApiToken}");
        StartProcess("powershell",
           new ProcessSettings {
               Arguments = new ProcessArgumentBuilder()
                .Append("-NoProfile")
                .Append("-NonInteractive")
                .Append($"-Command \"npm config set legacy-peer-deps=true @sitecore:registry=https://npm.sitecore.com/internal_prod/ //npm.sitecore.com/internal_prod/:_authToken={cloudSmithApiToken} ")
           });
    });

// Configure messaging project to build and publish it only if local version is newer version than the version on feed.
// We don't want to override the already published version.
Task("Horizon-Npm-ConfigureMessagingProject")
    .IsDependeeOf(NpmPlugin.Tasks.Prepration)
    .Does(() => {
        var hrzNpmConfig = GetBuildPluginConfiguration<NpmPluginConfiguration>();
        var hrzHorizonMessagingProj = hrzNpmConfig.Projects.Single(cfg => cfg.Path == "./src/Horizon.Messaging");

        var cloudSmithApiToken = Environment.GetEnvironmentVariable("CloudSmithApiToken", EnvironmentVariableTarget.Process);
        if (string.IsNullOrEmpty(cloudSmithApiToken)){
            Information("Could not find the api key for cloud smith api Token.");
            return;
        }

        Information($"Start restore cloud smith npm packages = {cloudSmithApiToken}");
        StartProcess("powershell",
           new ProcessSettings {
               WorkingDirectory = MakeAbsolute(Directory(hrzHorizonMessagingProj.Path)).FullPath,
               Arguments = new ProcessArgumentBuilder()
                .Append("-NoProfile")
                .Append("-NonInteractive")
                .Append($"-Command \"npm config set @sitecore:registry=https://npm.sitecore.com/internal_prod/ //npm.sitecore.com/internal_prod/:_authToken={cloudSmithApiToken}")
           });

        // Prefix all variables with hrz to avoid conflicts with variables defined by other plugins.
        StartProcess("powershell",
                new ProcessSettings {
                    WorkingDirectory = MakeAbsolute(Directory(hrzHorizonMessagingProj.Path)).FullPath,
                    RedirectStandardOutput = true,
                    Arguments = new ProcessArgumentBuilder()
                        .Append("-NoProfile")
                        .Append("-NonInteractive")
                        .Append($"-Command \"npm view @sitecore/horizon-messaging version\"")
                },
                out IEnumerable<string> hrzFeedVersionOutput);
        var hrzFeedVersion = hrzFeedVersionOutput.Single();
        Information($"Feed version: {hrzFeedVersion}");

        StartProcess("powershell",
                new ProcessSettings {
                    WorkingDirectory = MakeAbsolute(Directory(hrzHorizonMessagingProj.Path)).FullPath,
                    RedirectStandardOutput = true,
                    Arguments = new ProcessArgumentBuilder()
                        .Append("-NoProfile")
                        .Append("-NonInteractive")
                        .Append($"-Command \"node -p \\\"require('./package.json').version\\\"\"")
                },
                out IEnumerable<string> hrzLocalVersionOutput);
        var hrzLocalVersion = hrzLocalVersionOutput.Single();
        Information($"Local version: {hrzLocalVersion}");

        var hrzIsLocalVersionNewer = ParseSemVer(hrzLocalVersion) > ParseSemVer(hrzFeedVersion);
        Information($"Is local version newer: {hrzIsLocalVersionNewer}");

        if (hrzIsLocalVersionNewer) {
            hrzHorizonMessagingProj.DisableBuild = false;
            hrzHorizonMessagingProj.DisablePack = false;
            hrzHorizonMessagingProj.DisablePush = false;

            Information("!!!!!!!!! Enabled build and push to feed !!!!!!!!!");
        }
    });

// For builds on branch set a version that always wins over published NuGet version.
// It ensures that local artifacts always take precedence over packages pushed to NuGet feed.
Task("Horizon-SimpleVersion-SetPriorityVersion")
    .IsDependentOn(SimpleVersionPlugin.Tasks.CalculateVersion)
    .IsDependeeOf(DefaultBuild.Tasks.DisplayParameters)
    .WithCriteria(() => !simpleVersionPluginConfig.DisableCalculateVersion)
    .WithCriteria(() => !IsReleasableBranch(Configuration))
    .Does(() => {
        Information("Enabled because current branch is not releseable");

        var hrzOrigVer = ParseSemVer(Configuration.Version);
        Information($"Original version: {hrzOrigVer}");

        if (hrzOrigVer.Prerelease != null && hrzOrigVer.Prerelease.StartsWith("r")) {
            var hrzNewVer = hrzOrigVer.Change(prerelease: $"t{hrzOrigVer.Prerelease.Substring(1)}");

            Configuration.Version = hrzNewVer.ToString();
            Information($"Changed to new version: {hrzNewVer}");
        } else {
            Information("Did not change version as it does not contain a pre-release part starting with 'r'");
        }
    });

// Check if there is no change and update to the Horizon Feature Integration source code, exclude it from nuget package generation.
// It ensures that we dont build and publish HFI nuget packages if there is no change to the source code.
Task("Horizon-Skip-HFI-Packing")
    .IsDependeeOf("Brew-Plugins-DotNetCore-Pack")
    .IsDependentOn("Get-Latest-Published-HFI-Version")
    .Description("Check if there is no change to the Horizon Feature Integration source code, do not generate and publish its nuget packages.")
    .WithCriteria(() => IsRunningOnCI())
    .WithCriteria(() => skipHFIPacking)
    .Does(() => {
        List<string> hfiCodeChanges = new List<string>();

        if (string.IsNullOrEmpty(latestHFIVersion)){
            Information("Could not fetch latest published version of 'Sitecore.Horizon.Integration'.");
            return;
        }

        StartProcess("powershell",
                new ProcessSettings
                {
                    RedirectStandardOutput = true,
                    Arguments = new ProcessArgumentBuilder()
                        .Append("-NoProfile")
                        .Append("-NonInteractive")
                        .Append($"-Command git diff --name-only build/{latestHFIVersion} ./src/Sitecore.Horizon.Integration*")
                },
                out IEnumerable<string> changes);

        hfiCodeChanges.AddRange(changes);
        Information("Git diff changes list: ");
        Information(string.Join(Environment.NewLine, hfiCodeChanges));

        var hrzDotNetcoreConfig = GetBuildPluginConfiguration<DotNetCorePluginConfiguration>();

        if ( hfiCodeChanges.Count() == 0) {
            Information("Horizon Feature Integration is excluded from nuget package creation since there is no change to the source code.");
            hrzDotNetcoreConfig.PackExcludePatterns = new string[] {
                "Sitecore.Horizon.Integration.XM.Content.csproj",
                "Sitecore.Horizon.Integration.csproj",
                "Sitecore.Horizon.Integration.GraphQL.csproj",
                "Sitecore.Horizon.Integration.Editor.Tests.GraphQL.csproj"
            };
            isHFIPacked = false;
        }
    });

Task("Run-WhiteListChecker")
    .IsDependeeOf(DefaultBuild.Tasks.Pack)
    .IsDependentOn("Brew-Plugins-DotNetCore-Pack")
    .WithCriteria(() => isHFIPacked)
    .Does(() => {
        int exitCode = StartProcess("powershell",
                                new ProcessSettings {
                                    Arguments = new ProcessArgumentBuilder()
                                        .Append("-NoProfile")
                                        .Append("-NonInteractive")
                                        .Append($"-Command .\\buildscript\\WhiteListChecker.ps1")
                                });
        if (exitCode != 0) {
            throw new Exception("The WhiteListChecker failed.");
        }
    });

Task("Get-Latest-Published-HFI-Version")
    .IsDependeeOf("Horizon-Skip-HFI-Packing")
    .Does(()=>{
        var cloudSmithPassword = Environment.GetEnvironmentVariable("CLOUDSMITH_APIKEY", EnvironmentVariableTarget.Process);
        if (string.IsNullOrEmpty(cloudSmithPassword)){
            Information("Could not find cloudSmithPassword.");
            return;
        }

        var cloudSmithUsername = Environment.GetEnvironmentVariable("CLOUDSMITH_USERNAME", EnvironmentVariableTarget.Process);
        if (string.IsNullOrEmpty(cloudSmithUsername)){
            Information("Could not find cloudSmithUsername.");
            return;
        }

        StartProcess("powershell",
                new ProcessSettings
                {
                    RedirectStandardOutput = true,
                    Arguments = new ProcessArgumentBuilder()
                        .Append("-NoProfile")
                        .Append("-NonInteractive")
                        .Append($"-Command .\\buildscript\\getHFILatestVersion.ps1 -CloudSmithUser {cloudSmithUsername} -CloudSmithPassword {cloudSmithPassword}")
                }, out IEnumerable<string> latestVersion);

        latestHFIVersion = latestVersion.FirstOrDefault();
        Information($"latest published 'Sitecore.Horizon.Integration' version is: {latestHFIVersion}");
    });

Task("Horizon-Check-Braking-Changes-In-HFI")
    .IsDependeeOf(DefaultBuild.Tasks.Pack)
    .IsDependentOn("Brew-Plugins-DotNetCore-Pack")
    .Description("Check if Horizon Feature Integration (HFI) has introduced API breaking changes (BC). Stop build if BC introduced")
    .WithCriteria(() => isHFIPacked)
    .Does(() => {
        if (string.IsNullOrEmpty(latestHFIVersion)) {
            throw new CakeException("Could not fetch latest published version of 'Sitecore.Horizon.Integration'.");
        }
        
        var artifactsDir = "./artifacts";
        var workDir = artifactsDir + "/bc_check";
        CleanDirectory(workDir);

        void GetPackagesDlls(string version, string source, string targetDllsDir) {
            var targetPackagesDir = workDir + $"/packages_v_{version}";
            var packages = new[] {
                "Sitecore.Horizon.Integration",
                "Sitecore.Horizon.Integration.GraphQL"
            };            
            foreach (var packageId in packages) {
                Information($"Installing version '{version}' of package '{packageId}' into '{targetPackagesDir}'");
                NuGetInstall(packageId, new NuGetInstallSettings
                {
                    Source = new[] { source },
                    OutputDirectory = targetPackagesDir,
                    Version = version
                });            
            }
            CreateDirectory(targetDllsDir); 
            CopyFiles(GetFiles(targetPackagesDir + "/**/*.dll"), targetDllsDir);
        }

        var prevDllsDir = workDir + "/dlls_previous";
        GetPackagesDlls(latestHFIVersion, "https://nuget.sitecore.com/internal_prod/v3/index.json", prevDllsDir);

        var newDllDir = workDir + "/dlls_current";
        GetPackagesDlls(Configuration.Version, MakeAbsolute(Directory(artifactsDir)).FullPath, newDllDir);

        var checkResultPath = $"{workDir}/bcCheckResults.txt";
        Information($"Execute ApiCheck. Result is written to '{checkResultPath}'");
        var bcCount = StartProcess(Context.Tools.Resolve("ApiCheck.exe"), new ProcessSettings {
            Arguments = new ProcessArgumentBuilder()
            .Append(prevDllsDir)
            .Append(newDllDir),
            RedirectStandardOutput = true
        }, out redirectedStandardOutput);
        var result = string.Join("\n", redirectedStandardOutput);
        StartPowershellScript($"Set-Content -Path {checkResultPath} \"{result}\"");

        if (bcCount > 0) throw new Exception($"Detected {bcCount} breaking changes. Read '{checkResultPath}' for details.");
    });

//////////////////////////////////////////////////////////////////////
// EXECUTION
//////////////////////////////////////////////////////////////////////

RunTarget(target);
