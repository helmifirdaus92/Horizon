param(
    [Parameter(Mandatory=$false)]
    [string] $NuGetFeed = "http://nuget1dk1/nuget/Tools/",
    [switch] $Remove,
    [Parameter(Mandatory=$false)][string]$RepositoryRoot
)

# Sitecore Quality Model install/update script.
# Run this script to trigger installation or update of the Solution-wide SCQM package.
# Notice, this file might be updated during the installation - please always commit the changes.

$solutionPackageId = "Sitecore.CodeQuality.Solution"
$tmpFolderName = ".SCQM_Temp"
$updateRunnerPackageRelativePath = "tools/SolutionInstall.ps1"

# Define "this" directory and path
$rootDir = $PSScriptRoot
$selfPath = $MyInvocation.MyCommand.Path
if(!$RepositoryRoot){
    $RepositoryRoot = git rev-parse --show-toplevel
}

Write-Host "********************************************" -ForegroundColor Green
Write-Host "Installing/updating the Sitecore Quality Model solution-wide package" -ForegroundColor Green
Write-Host
Write-Host

# Prepare temp folder
$tmpFullPath = Join-Path $rootDir $tmpFolderName
if (Test-Path $tmpFullPath -PathType Container){
    Write-Host "[Bootstrap] Cleaning temp folder from the previous installation... " -NoNewline
    Remove-Item -Path $tmpFullPath -Recurse -Force
    Write-Host "Done!" -ForegroundColor Green
}

New-Item -Path $tmpFullPath -ItemType Directory | Out-Null
Write-Host "[Bootstrap] Created temp folder: $tmpFullPath"

# Download SCQM.Solution package to the TMP folder
Write-Host "[Bootstrap] Installing the '$solutionPackageId' package... "
& nuget.exe install $solutionPackageId -Source $NuGetFeed -OutputDirectory $tmpFullPath -NonInteractive -ExcludeVersion
if($LASTEXITCODE -ne 0) {
    Write-Host
    throw "Unable to download package '$solutionPackageId' from '$nugetFeed'"
}
Write-Host "[Bootstrap] Installed the '$solutionPackageId' package." -ForegroundColor Green

# Pass control to the downloaded package
$packageRootPath = Join-Path $tmpFullPath $solutionPackageId
$runnerPath = Join-Path $packageRootPath $updateRunnerPackageRelativePath
if(-not (Test-Path $runnerPath)) {
    throw "Unable to find entry point: '$runnerPath'"
}

Write-Host "[Bootstrap] Running the entry point from the downloaded package ('$runnerPath')... "
& $runnerPath -SolutionDir $rootDir -PackageRoot $packageRootPath -BootstrapFilePath $selfPath -PerformInstall (-not $Remove.IsPresent) -RepositoryRoot $RepositoryRoot

# Cleanup the Temp folder
Write-Host "[Bootstrap] Cleaning temp folder after the installation... " -NoNewline
Remove-Item -Path $tmpFullPath -Recurse -Force
Write-Host "Done!" -ForegroundColor Green

# Write about successful installation
Write-Host
Write-Host
Write-Host "********************************************" -ForegroundColor Green
Write-Host "Installation/update finished!" -ForegroundColor Green
