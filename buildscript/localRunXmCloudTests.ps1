
param(
    [Parameter(Mandatory = $false)][string]$cmHostUrl = "https://xmcloudcm.localhost/",
    [switch]$doNotUpdateTools = $True
)

$elapsed = [System.Diagnostics.Stopwatch]::StartNew()
$reportColor = "red"

try {
    if (!$metaVer) {
       $metaVer = Get-Content "program.version"
    }

    if (!$doNotUpdateTools) {
        ri "$PSScriptRoot\tools" -Force -Recurse -ErrorAction Ignore
    }

    nuget install Program.Meta.$metaVer -Source "https://nuget1dk1/nuget/tools" -OutputDirectory tools -x
    ."$PSScriptRoot\tools\program.meta.$metaVer\configuration\program.globals.ps1"
    $packageInstallationScriptPath = "$PSScriptRoot\tools\$psAdsPackageName\Tools"

    $localSource = "$((Split-Path $PSScriptRoot -Parent))\artifacts"

    $runParams += @("-cmHostUrl", $cmHostUrl)
    $runParams += @("-programVersion", $metaVer)
    $runParams += @("-localSource", $localSource)
    $runParams += @("-packageInstallationScriptPath", $packageInstallationScriptPath)
    $runParams += @("-runSwitches", "GraphQLIntegrationTests:true")

    Write-Host "DEBUG Value of "{$runParams}": $runParams"

    powershell -NoProfile ".\xmCloudTest.ps1 $runParams" | Tee-Object -file runXmCloudTests.log

    $reportColor = "green"
}
finally {
    Write-Host "Total time: $($elapsed.Elapsed.ToString())" -ForegroundColor $reportColor
}
