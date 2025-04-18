param (
    [string] $Topology = "xm1",
    [string] $TargetOs = "ltsc2019",
    [string] $ProgramVersion = "10.4.0",
    [string] $PlatformTag,
    [string] $ClientId,
    [string] $ClientSecret,
    [PSCustomObject] $CustomEnvParams,
    [bool] $EnableSXA = $false,
    [bool] $EnableDAM = $false
)

. "$PSScriptRoot\dockerUtils.ps1"

function Invoke-BuildAndDeploy {
    param (
        [string] $Topology = "xmcloud",
        [string] $TargetOs = "ltsc2019",
        [string] $PlatformTag,
        [bool] $EnableSXA = $false,
        [bool] $EnableDAM = $false
    )

    Write-Host "----------Starting Horizon Deployment to Docker---------------"
    $buildFolder = "$PSScriptRoot\..\build-images"
    $deployFolder = "$PSScriptRoot\..\deploy\runspace"
    Write-Host "----------Starting getting platform docker configuration---------------"
    Write-Host "----------Topology for BaseImage : $Topology"

    if (Test-Path $deployFolder) { Remove-Item -Path "$($deployFolder)\*" -Force -Recurse }
    Get-DockerConf -Destination $deployFolder -Topology $Topology -TargetOs $TargetOs -PlatformTag $PlatformTag -ProgramVersion $programVersion

    # To pin a particular version of XMC
    #   If (!(Test-Path $deployFolder)) {
    #     New-Item -Path $deployFolder -ItemType Directory
    #    }
    #    Copy-Item "\\mars\QA\Sitecore XMCloud\1.6\Sitecore XMCloud 1.6.53\containers\ltsc2019" $deployFolder -Recurse -Force

    if(Test-Path "$deployFolder\$TargetOs") {
        Write-Host "Setting deploy folder to $deployFolder\$TargetOs"
        $deployFolder = "$deployFolder\$TargetOs";
     }
    Write-Host "----------Starting building test images---------------"
    # build images
    Invoke-BuildTestImages -Topology $Topology `
        -PlatformEnvPath "$deployFolder\.env" `
        -DockerComposeDestination $buildFolder

    # clean up ps.ads certificates
    Get-ChildItem -Path "$deployFolder\traefik" -Recurse | Foreach-object { Remove-item -Recurse -path $_.FullName }

    $composeArguments = "-f docker-compose.yml "
    Get-ChildItem -Path $deployFolder -File -Filter "docker-compose.override.yaml" | ForEach-Object {
        $composeArguments += "-f $($_.Name) "
    }
    if ($EnableSXA -eq $true) {
        $composeArguments += "-f sxa.override.yaml "
    }
    if ($EnableDAM -eq $true) {
        $composeArguments += "-f dam.override.yaml "
    }

    Write-Host "---- composeArguments: $composeArguments----" -ForegroundColor Cyan

    # patch env file
    $envFile = Join-Path $deployFolder ".env"
    if ($null -ne $CustomEnvParams) {
        $envVars = ConvertFrom-StringData (Get-Content "$envFile" -Raw)
        $CustomEnvParams.PSObject.Properties | ForEach-Object { $envVars.$($_.Name) = $($_.Value) }
        $envVars.GetEnumerator() | ForEach-Object { "$($_.Name)=$($_.Value)" } | Out-String | Out-File $envFile -Encoding default
    }

    # regenarate certificates
    $ahHost = "ah.$($Topology)cm.localhost"
    $cmHost = "$($Topology)cm.localhost"
    $renderingHost = "eh.$($Topology)cm.localhost"
    $hosts = @($cmHost, $ahHost, $renderingHost)
    New-ComposeCertificates -traefikLocation "$deployFolder\traefik"  -hosts $hosts

    Invoke-Expression ("iisreset /stop")

    AddHostsHrz -Topology $Topology

    # run docker images
    Copy-Item "$PSScriptRoot\..\deploy\docker-compose*.yaml" $deployFolder -Recurse -Force
    Push-Location $deployFolder
    Invoke-CommandErrorsHandled { Invoke-Expression ( "docker-compose up -d" ) }
    # Just keeping this for time being until the new script is ready
    # Invoke-CommandErrorsHandled { Invoke-Expression ( "docker-compose -f docker-compose.nocm.yaml up -d" ) }
    Pop-Location

    Test-SiteAvailability -Url "https://$($Topology)cm.localhost/HelperWebService.asmx" -retries 20
}

Invoke-BuildAndDeploy -Topology $Topology -PlatformTag $PlatformTag -TargetOs $TargetOs -EnableSXA $EnableSXA -EnableDAM $EnableDAM
