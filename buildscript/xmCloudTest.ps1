param(
    [Parameter(Mandatory = $true)][string]$cmHostUrl,
    [Parameter(Mandatory = $false)]$programVersion,
    [Parameter(Mandatory = $false)]$packageInstallationScriptPath,
    [Parameter(Mandatory = $false)]$localSource,
    [Parameter(Mandatory = $false)]$runSwitches,
    [Parameter(Mandatory = $false)]$categories,
    [Parameter(Mandatory = $false)]$excludecategories
)

Function SetEnvVariable-CmUrl {
    param(
        [string] $cmHostUrl
    )
    Write-Host "------------------ Configuring API Tests ------------------"
    Write-Host "CmUrl set to: $cmHostUrl"
    $env:CMUrl = $cmHostUrl

    Write-Host "CmUrl environment variable set to: $env:CMUrl"
    Write-Host "Configuring API Tests...Done"
}
# Script starts
$ErrorActionPreference = "Stop"

SetEnvVariable-CmUrl -cmHostUrl $cmHostUrl

Push-Location $PSScriptRoot\..\tests\Sitecore.Horizon.Integration.GraphQL.Tests

Invoke-Expression "dotnet test --filter 'Category=BITest' -l teamcity"

Pop-Location