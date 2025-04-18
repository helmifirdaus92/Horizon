$dbServer = ".\SQL2017"
$reportColor = "red"
$deployParams = @()

function PromptOption {
    while ($true) {
        Write-Host
        Write-Host -ForegroundColor DarkYellow @"
Select task:
q - exit
1 - Deploy Horizon parts only
2 - Deploy SXP platform
3 - Deploy XMCloud and Horizon by Legolend
4 - Deploy XMCloud only by docker compose
5 - Deploy XMCloud and Horizon by docker compose
6 - Update Horizon container only (Chose this option only if you have a fully deployed env already)

"@
        Write-Host "Enter your choice: " -NoNewLine
        $task = Read-Host

        Write-Host

        switch ($task) {
            "q" { return }

            "1" {
                return Task-DeployHorizonPartsOnly
            }
            "2" {
                return Task-DeploySxpPlatform
            }
            "3" {
                return Task-DeployXMCloudByLegolend
            }
            "4" {
                return Task-DeployXMCloudOnlyByDockerCompose
            }
            "5" {
                return Task-DeployXMCloudAndHorizonByDockerCompose
            }
            "6" {
                return Task-UpdateHorizonContainerOnly
            }
            default {
                Write-Host "Wrong choice: $task" -ForegroundColor Red
            }
        }
    }
}

function Task-DeployHorizonPartsOnly {
    . {
        $InstanceName = "horizon"
        $SkipPsAdsImport = $false

        if (!$SkipPsAdsImport) {
            # Get and import ADS to use legoland features
            $programVersion = Get-Content "$PSScriptRoot\program.version"
            & nuget install "Program.Meta.$programVersion" -Source "https://nuget1dk1/nuget/tools" -OutputDirectory "$PSScriptRoot\tools" -x
            Invoke-Expression "$PSScriptRoot\tools\program.meta.$programVersion\configuration\program.globals.ps1"
            Invoke-Expression "$PSScriptRoot\tools\$global:psAdsPackageName\tools\ImportADS.ps1"
        }

        Import-Module "$PSScriptRoot\deploy\InstallerModules.psm1" -Force
        Import-Module "$PSScriptRoot\extensions.psm1" -Force

        $authoringHostPostfix = $authoringHostPostfix

        $deployConfig = Get-Content "$PSScriptRoot\deploy.config.json" | ConvertFrom-Json
        $horizonFeatureIntegrationVersion = $deployConfig.customParameters.featureIntegration.version;
        $nugetConfigSources = Select-Xml -XPath "/configuration/packageSources/add/@value" -Path "$PSScriptRoot\..\nuget.config"
        $nugetPackageSources = ($nugetConfigSources | ForEach-Object { $_.Node.Value }) -join ";"
        $nugetPackageSources = "$nugetPackageSources;$PSScriptRoot\..\artifacts"
        $ahInstanceName = "$InstanceName$authoringHostPostfix"

        Write-Host "Cleaning up of the previously installed horizon host instance started!" -ForegroundColor Green
        Uninstall-HorizonAuthoringHost -InstanceName "$ahInstanceName"

        Write-Host "Installation of the horizon host instance started!" -ForegroundColor Green

        $installArgs = @{
            horizonInstanceName              = "$ahInstanceName"
            horizonHostPackagePath           = GetHorizonHostPackagePath
            horizonFeatureIntegrationVersion = $horizonFeatureIntegrationVersion
            sitecoreCmInstanceName           = $InstanceName
            licensePath                      = "\\mars\Installs\Licenses\Sitecore Partner License\license.xml"
            identityServerPoolName           = "$InstanceName-IdentityServer"
            nugetPackageSources              = $nugetPackageSources
        }
        InstallHorizonAuthoringHost @installArgs
    } | Out-Null
}

function Task-DeploySxpPlatform {

    $deployParams += ("-useSif", $true)
    $deployParams += ("-useContainers", $false)
    $deployParams += ("-dbServer", $dbServer)
    $deployParams += ("-runSwitches", "'SkipTestsDeployment:true,extensibility:true,enableContentHub:true,enableSXA:false'")

    return $deployParams
}

function Task-DeployXMCloudByLegolend {

    $deployParams += ("-useSif", $false)
    $deployParams += ("-useContainers", $false)
    $deployParams += ("-dbServer", $dbServer)
    $deployParams += ("-runSwitches", "'SkipTestsDeployment:true,extensibility:false,enableContentHub:false,enableSXA:false'")

    return $deployParams
}

function Task-DeployXMCloudOnlyByDockerCompose {

    Write-Host "Enter your ClientSecret: " -NoNewLine
    $servicePrincipalClientSecret = Read-Host
    function Stop-Containers {
        $artifactsLocation = "$PSScriptRoot\containers"
        if (Test-Path $artifactsLocation) {
            try {
                Write-Host "Stopping containers from '$artifactsLocation'..." -ForegroundColor Green
                Push-Location $artifactsLocation
                docker-compose down
            }
            finally {
                Pop-Location
            }
        }
    }

    $global:programVersion = Get-Content "program.version"
    Write-Host "Program version $global:programVersion"

    Stop-Containers
    # Clear containers folder from previous deployment if any
    $containersBuildFolder = "$PSScriptRoot\containers"
    if (Test-Path $containersBuildFolder) {
        Remove-Item $containersBuildFolder -Recurse -Force
    }

    $deployParams += ("-useSif", $false)
    $deployParams += ("-useContainers", $true)
    $deployParams += ("-containersDeploymentTopology XMCloud")
    $deployParams += ("-dbServer", $dbServer)
    $deployParams += ("-runSwitches", "'SkipTestsDeployment:true,extensibility:false,enableContentHub:false,enableSXA:false'")
    $deployParams += ("-servicePrincipalClientId", "5140ef5e-6e9a-419b-92bb-930579f6a168")
    $deployParams += ("-servicePrincipalClientSecret", $servicePrincipalClientSecret)

    return $deployParams
}

function Task-DeployXMCloudAndHorizonByDockerCompose {

    $deployParams += ("-useSif", $false)
    $deployParams += ("-useContainers", $false)
    $deployParams += ("-useCustomDeploy", $true)
    $runSwitches = "'SkipTestsDeployment:true,customComposeDeploy:true,Smoke:true,enableContentHub:false,enableSXA:false,WithSpeedOptimization:false'"
    $deployParams += ("-runSwitches", $runSwitches)

    return $deployParams
}

function Task-UpdateHorizonContainerOnly {
    Import-Module "$PSScriptRoot\extensions.psm1"
    . "..\container\scripts\dockerUtils.ps1"
    
    $hrzArtifactsFolder = ".\..\container\build-images\hrz\horizonArtifacts"
    $buildImagesFolder = ".\..\container\build-images"
    $deployFolder = ".\..\container\deploy\runspace"
    
    Write-Host "Clear-Horizon artifacts from docker build context"
    if (Test-Path $hrzArtifactsFolder) { Remove-Item $hrzArtifactsFolder -Force -Recurse }
    Extract-HorizonArtifacts $hrzArtifactsFolder

    Write-Host "Rebuild horizon image"
    Push-Location $buildImagesFolder
    Invoke-CommandThrowErrors { docker-compose build hrz --no-cache }
    Pop-Location

    Write-Host "Update compose project"    
    Push-Location $deployFolder
    Invoke-CommandThrowErrors { docker-compose up -d }
    # Invoke-CommandThrowErrors { docker-compose -f docker-compose.nocm.yaml up -d  }
    Pop-Location
    Exit;
}

try {
    $elapsed = [System.Diagnostics.Stopwatch]::StartNew()

    $deployParams += ("-cleanInstance", $false)
    $deployParams += ("-skipTests", $true)
    $deployParams += PromptOption
    Write-Host "Deploy Parameters : $deployParams"
    if (!$deployParams) {
        $reportColor = "green"
        return
    }

    $metaVer = Get-Content "program.version"
    ri "$PSScriptRoot\tools" -Force -Recurse -ErrorAction Ignore
    nuget install "Program.Meta.$metaVer" -Source "http://nuget1dk1:8181/nuget/tools" -OutputDirectory tools -x
    powershell -NoProfile ".\tools\program.meta.$metaVer\configuration\startDeployment.ps1 $deployParams" | Tee-Object -file deploy.log
    if ($LASTEXITCODE) { throw "Deploy is failed." }
    $reportColor = "green"
}
finally {
    Write-Host "Total time: $($elapsed.Elapsed.ToString())" -ForegroundColor $reportColor
}
