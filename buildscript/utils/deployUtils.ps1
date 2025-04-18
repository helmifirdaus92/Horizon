
. .\..\container\scripts\dockerUtils.ps1

function Get-ConfigValues {
    param (
        [string] $pathToConfig
    )
    # Read JSON from a file
    $jsonContent = Get-Content -Path $pathToConfig -Raw

    # Convert JSON content to a PowerShell object
    $psObject = $jsonContent | ConvertFrom-Json
    
    return $psObject
}

function Invoke-CommandThrowErrors {
    param(
        [ScriptBlock] $command
    )
    $commandFailed = $false
    Write-Host "[Invoke-CommandThrowErrors] $command"
    Write-Host "$($($(Invoke-Command $command) 2>&1) | ForEach-Object { if ($_ -match "error:|failed:") { Write-Host "$_" -ForegroundColor "Red"; $commandFailed = $true; } else { Write-Host "$_" } })"
    if ($commandFailed) {
        throw "$command Failed"
    }
}
function Prepare-FeatureIntegrationArtifacts {
    param (
        [string] $sourceFolder,
        [string] $targetFolder,
        [string] $packageName
    )
    Write-Host "Prepare-FeatureIntegrationArtifacts"
    nuget sources add -Name local_artifacts -Source $sourceFolder
    nuget install Sitecore.Horizon.Integration.XM.Content -OutputDirectory $targetFolder

    # Collect all the dlls to a bin folder
    $binFolder = "$($targetFolder)\bin"

    # Ensure the target folder exists
    if (-not (Test-Path -Path $binFolder)) {
        New-Item -ItemType Directory -Path $binFolder -Force | Out-Null
    }
    # File extensions to search for
    $fileExtensions = @("*.dll", "*.xml")

    # Iterate through each file extension
    foreach ($extension in $fileExtensions) {
        # Get all files with the current extension from the source folder and its subfolders
        $files = Get-ChildItem -Path $targetFolder -Recurse -Filter $extension

        # Copy each file to the target folder
        foreach ($file in $files) {
            # Construct the destination path
            $destinationPath = Join-Path -Path $binFolder -ChildPath $file.Name

            # Copy the file
            Copy-Item -Path $file.FullName -Destination $destinationPath -Force
        }
    }

    Write-Output "All .dll files have been copied to $binFolder"
}
function Prepare-HorizonArtifacts {
    param (
        [string] $hrzArtifactsFolder
    )
    Write-Host "Extract-HorizonArtifacts"
    Expand-Archive `
        -Path .\..\artifacts\HorizonHost.*.zip `
        -DestinationPath $hrzArtifactsFolder `
        -Force
}
function Prepare-JSSArtifacts {
    param (
        [string] $buildImagesFolder
    )
    Push-Location "$buildImagesFolder\jsshost"

    $folderPath = "xmcloud-foundation-head-staging"
    if (Test-Path $folderPath) {
        Remove-Item -Recurse -Force -Path $folderPath
    }

    Invoke-CommandErrorsHandled { Invoke-Expression ( "git clone https://github.com/sitecorelabs/xmcloud-foundation-head-staging.git" ) }
    Copy-Item "CustomComponent.tsx" "xmcloud-foundation-head-staging\headapps\nextjs-starter\src\components" -Recurse -Force
    Set-Location ..
    Pop-Location
}
function Get-DockerConf {
    param(
        [string] $targetOs,
        [string] $destination
    )

    Write-Host "----------Getting Docker Configuration---------------"

    $paths = Get-ChildItem -Path "\\mars\QA\Sitecore XMCloud\*\*" | Sort-Object CreationTime
    $dockerComp = $paths[-1].FullName + "\containers"
    $dockerCompOsVersion = Join-Path $dockerComp $targetOs
    if (Test-Path -Path $dockerCompOsVersion -PathType Container) {
        $dockerComp = $dockerCompOsVersion
    }

    Write-Host "Copying docker configuration to folder: $destination from: $dockerComp"
    if (!(Test-Path $dockerComp)) { throw "Configuration path does not exist" }
    Copy-Item "$dockerComp\*" $destination -Recurse -Force | Out-Null
}
function Prepare-DockerSetup-CMImage {
    param (
        [string] $buildArtifactsFolder,
        [string] $fiArtifactsFolder
    )

    Prepare-FeatureIntegrationArtifacts $buildArtifactsFolder $fiArtifactsFolder -packageName "Sitecore.Horizon.Integration.XM.Content"
    if ($env:TEAMCITY_VERSION) {
        $azureConatinerRegistry = "ideftdevacr"
        Write-Host "Login to $($azureConatinerRegistry)"
        az login --service-principal -u $env:servicePrincipalClientId -p $env:servicePrincipalClientSecret --tenant $env:servicePrincipalTenantId
        az acr login --name $azureConatinerRegistry
    }
    Get-DockerConf "ltsc2019" $deployFolder

    Write-Host "---- Start patching cm image ----" -ForegroundColor Cyan

    $platformEnv = Get-Content "$($deployFolder)\.env" | ConvertFrom-StringData

    Write-Host "---------------------Platform Version used for build--------------------------" -ForegroundColor Cyan
    Write-Host "---------------------$($platformEnv.SITECORE_VERSION)-------------------------" -ForegroundColor Cyan

    # Patch build .env file
    $envFile = Join-Path $buildFolder ".env"
    $envVars = ConvertFrom-StringData (Get-Content "$envFile" -Raw)
    $cmBaseImageName = "$($platformEnv.SITECORE_DOCKER_REGISTRY)sitecore-xmcloud-cm:$($platformEnv.SITECORE_VERSION)"

    $envVars.CM_BASE_IMAGE = $cmBaseImageName
    $envVars.GetEnumerator() | ForEach-Object { "$($_.Name)=$($_.Value)" } | Out-String | Out-File $envFile -Encoding default
}

function Build-Images {
    param(
        [string[]] $imagesList
    )
    $services = $imagesList -join ", "
    
    Write-Host "##teamcity[blockOpened name='Build test images']"
    Push-Location $buildFolder    
    Invoke-CommandThrowErrors { Invoke-Expression ("docker-compose -f .\docker-compose.yml build $($services)") }
    Pop-Location
    Write-Host "##teamcity[blockClosed name='Build test images']"
}

function Deploy-Containers {
    param (
        [string[]] $composefiles
    )
    Write-Host "##teamcity[blockOpened name='Deploy containers']"
    Copy-Item ".\..\container\deploy\docker-compose*.yaml" $deployFolder -Force
    $composeArguments = $composefiles -join " -f "
    
    Write-Host "composeArguments:  docker-compose -f $composeArguments up -d"
    Push-Location $deployFolder
    Invoke-CommandThrowErrors { Invoke-Expression ("docker-compose -f $($composeArguments) up -d") }
    Pop-Location
    Write-Host "##teamcity[blockClosed name='Deploy containers']"    
}

function Add-Certificates-And-AddHostname {
    param (
        [string] $deployFolder,
        [string[]] $hosts
    )
    New-ComposeCertificates -traefikLocation "$deployFolder\traefik" -hosts $hosts
    $hosts | ForEach-Object {
        Add-HostHeader -Hostname $_
    }
}
function Remove-HostHeaders {
    param (
        [string[]] $hosts
    )
    $hosts | ForEach-Object {
        Remove-HostHeader -Hostname  $_
    }
}
function Initialize-SitecoreCli {

    $dotnetToolConfigFolder = ".config"
    $dotnetToolCacheFolder = "~\.dotnet\toolResolverCache\1"
    if (Test-Path $dotnetToolConfigFolder) { Remove-Item $dotnetToolConfigFolder -Force -Recurse }
    # Clear dotnet tool cache for sitecore.cli (there might be an error due to a bug)
    if (Test-Path $dotnetToolCacheFolder) {
        Push-Location $dotnetToolCacheFolder
        Remove-Item "sitecore.cli" -Force -Erroraction silentlycontinue
        Pop-location
    }

    dotnet new tool-manifest --force
    dotnet tool install Sitecore.CLI --version "5.*" --ignore-failed-sources
    dotnet tool restore --tool-manifest .config\dotnet-tools.json

    Write-Host "Waiting for tool restore to take effect..." -ForegroundColor Green
    Start-Sleep -Seconds 5
    dotnet sitecore init
    dotnet sitecore plugin init --overwrite
}
function Login-SitecoreCli {

    dotnet sitecore login --cm "https://xmcloudcm.localhost" `
        --auth $sitecoreFedAuthAuth0Domain `
        --audience $sitecoreFedAuthAuth0CliAudience `
        --client-id $sitecoreFedAuthAuth0CliClientId `
        --client-secret $sitecoreFedAuthAuth0CliClientSecret `
        --client-credentials true `
        --allow-write true
}

function Test-SiteAvailability {
    param(
        [string]$url,
        [int]$retries = 3,
        [int]$intervalSec = 3
    )

    $client = New-Object System.Net.WebClient

    $originalRetryCount = $retries

    do { Start-Sleep -Seconds $intervalSec; $retries-- } 
    until (
        $(try {
                Write-Host "[$($originalRetryCount - $retries)] Requesting: $url"
                $response = $client.DownloadString($($url))
                Write-Host "Response code: OK"
                $null -ne $response
            }
            catch [System.Net.WebException] { 
                Write-Host "A web exception was caught (waiting for another $intervalSec sec.): $($_.Exception.Message)"
                if ($_.Exception.InnerException) {
                    Write-Host "Inner Exception: $($_.Exception.InnerException.Message)"
                }
            }) -or $retries -lt 1
    )
}

function Update-DockerEnvFile {
    param (
        [string] $envFile,
        [PSCustomObject] $CustomEnvParams
    )
    $envVars = ConvertFrom-StringData (Get-Content "$envFile" -Raw)
    $CustomEnvParams.PSObject.Properties | ForEach-Object { $envVars.$($_.Name) = $($_.Value) }
    $envVars.GetEnumerator() | ForEach-Object { "$($_.Name)=$($_.Value)" } | Out-String | Out-File $envFile -Encoding default
}
function Clear-DockerSystem {
    $containers = $(docker ps -a -q)
    if ($containers) {
        docker stop $containers
    }
    docker container prune --force
    docker network prune --force
    docker volume prune --force
}