param(
        [string]$Step = "build",
        [string]$NugetServer = "nuget1dk1",
        [string]$BootstrapperProject = "Tools.Sitecore.Orchestration.Bootstrapper",
        [string]$AssetsDir = "Install",
        [Parameter(ValueFromRemainingArguments = $true)]
        $toolingAruments
    )

    $downloadUri = "http://$NugetServer/endpoints/$AssetsDir/content/$BootstrapperProject/"

    $htvars = @{}
    if($toolingAruments) {
        $toolingAruments | ForEach-Object {
            if($_ -match '^-[^-]') {
                #New parameter
                $lastvar = ($_ -replace '^-') -replace ':$'
                $htvars[$lastvar] = $null
            } else {
                #Value
                $htvars[$lastvar] = $_
            }
        }
    }

    $downloadUri = $downloadUri + "$Step.ps1"

    if (-not (Test-Path "$Step.ps1")){
        Write-Host "[Orchestration] Downloading bootstrapper for step $Step from '$downloadUri' to '$Step.ps1'"
        Invoke-RestMethod -UseDefaultCredentials -Uri $downloadUri -OutFile "$Step.ps1"
    }

    Write-Host "[Orchestration] Calling Step with:"
    $htvars | ConvertTo-Json -Depth 5 | Out-String

    &".\$Step.ps1" @htvars
    exit $LASTEXITCODE
