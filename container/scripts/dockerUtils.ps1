$global:opensslLocation = "C:\Program Files\Git\usr\bin\openssl.exe"
function Invoke-CommandErrorsHandled {
  param(
    [ScriptBlock] $command
  )
  Write-Host "[Invoke-CommandErrorsHandled] $command"
  Write-Host "$($($(Invoke-Command $command) 2>&1) | ForEach-Object { if ($_ -match "error:|failed:") { Write-Error "$_" } else { Write-Host "$_" } })"
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

function New-ComposeCertificates {
    param(
        [Parameter(Mandatory = $true)]
        [string] $traefikLocation,
        [Parameter(Mandatory = $true)]
        [string[]] $hosts
      )
  Set-Alias '_ix1' -value 'Invoke-CommandErrorsHandled'

  $source = ".\"
  $openssl = $global:opensslLocation
  _ix1 {
    $caCertSubject = "/C=UA/ST=DN/O=Docker Root CA(ADS)"
    Write-Verbose "& $openssl req -x509 -nodes -new -sha256 -days 1024 -newkey rsa:2048 -keyout $source\RootCA`.key -out $source\RootCA`.pem -subj ""$caCertSubject"""
    & $openssl req -x509 -nodes -new -sha256 -days 1024 -newkey rsa:2048 -keyout $source\RootCA`.key -out $source\RootCA`.pem -subj "$caCertSubject"
    Write-Verbose "& $openssl x509 -outform pem -in $source\RootCA.`pem -out $source\RootCA`.crt"
    & $openssl x509 -outform pem -in $source\RootCA.`pem -out $source\RootCA`.crt
    Write-Verbose "CA cert creating done"
    Write-Verbose "Adding CA to trusted root"
    & certutil -addStore Root $source\RootCA`.crt
  }

  $out = "$traefikLocation\certs"
  $config = "$traefikLocation\config\dynamic"
  if (!(Test-Path -Path $out)) {
    New-Item -ItemType Directory -Force -Path $out
  }
  if (!(Test-Path -Path $config)) {
    New-Item -ItemType Directory -Force -Path $config
  }
  $configContent =
  @"
tls:
    certificates:
"@
  $hosts | ForEach-Object {
    $configContent = $configContent +
    "
        - certFile: C:\etc\traefik\certs\$_.crt
          keyFile: C:\etc\traefik\certs\$_.key"

    _ix1 {
      @"
authorityKeyIdentifier=keyid,issuer
basicConstraints=CA:FALSE
keyUsage = digitalSignature, nonRepudiation, keyEncipherment, dataEncipherment
subjectAltName = @alt_names
[alt_names]
DNS.1 = $_
"@ | Set-Content "$source/domains.ext"
      $siteCertSubject = "/C=UA/ST=DN/O=Sitecore, Inc./CN=$_"
      Write-Verbose "& $openssl -new -nodes -newkey rsa:2048 -keyout $out\$_`.key -out $out\$_`.csr -subj ""$siteCertSubject"""
      & $openssl req -new -nodes -newkey rsa:2048 -keyout $out\$_`.key -out $out\$_`.csr -subj "$siteCertSubject"
      Write-Verbose "& $openssl x509 -req -sha256 -days 1024 -in $out\$_`.csr -CA $source\RootCA`.pem -CAkey $source\RootCA`.key -CAcreateserial -extfile ""domains.ext"" -out $out\$_`.crt"
      & $openssl x509 -req -sha256 -days 1024 -in $out\$_`.csr -CA $source\RootCA`.pem -CAkey $source\RootCA`.key -CAcreateserial -extfile "domains.ext" -out $out\$_`.crt
      Write-Verbose "$_ done"
    }
  }


  Set-Content -Path "$config/certs_config.yaml" -Value $configContent
}

function AddHostsHrz {
  param(
    [string] $Topology = "xp0"
  )
  Add-HostHeader -Hostname "$($Topology)cm.localhost"
  Add-HostHeader -Hostname "ah.$($Topology)cm.localhost"
  Add-HostHeader -Hostname "eh.$($Topology)cm.localhost"
}

function RemoveHostsHrz {
  param(
    [string] $Topology = "xp0"
  )
  Remove-HostHeader -Hostname "$($Topology)cm.localhost"
  Remove-HostHeader -Hostname "ah.$($Topology)cm.localhost"
  Remove-HostHeader -Hostname "eh.$($Topology)cm.localhost"
}

function Get-DockerConf {
  param(
    [string] $Destination,
    [string] $Topology,
    [string] $TargetOs,
    [string] $PlatformTag,
    [string] $ProgramVersion,
    [Parameter(Mandatory = $false)][bool]$UseKubernetes
  )

  if (Test-Path $Destination) {
    Remove-Item -Path $Destination -Recurse -Force
  }

  Write-Host "----------Getting Docker Configuration---------------"

  if ([string]::IsNullOrEmpty($PlatformTag)) {
    Get-DockerConfiguration -InstanceVersion $ProgramVersion -Topology $Topology -OutputFolder $Destination -osVersion $TargetOs -UseKubernetes $UseKubernetes
  }
  else {
    $Tag = "$PlatformTag-$TargetOs"
    Get-DockerConfiguration -InstanceVersion $ProgramVersion -Topology $Topology -OutputFolder $Destination -osVersion $TargetOs -SitecoreTag $Tag -UseKubernetes $UseKubernetes
  }
}

function Invoke-BuildTestImages {
  param (
    [string] $Topology = "xmcloud",
    [string] $PlatformEnvPath,
    [string] $DockerComposeDestination
  )

  $Topology = $Topology.ToLower();
  $platformEnv = Get-Content $PlatformEnvPath | ConvertFrom-StringData

  Write-Host "---------------------Platform Version used for build--------------------------" -ForegroundColor Cyan
  Write-Host "---------------------$($platformEnv.SITECORE_VERSION)-------------------------" -ForegroundColor Cyan
  # Patch build .env file
  $envFile = Join-Path $DockerComposeDestination ".env"
  $envVars = ConvertFrom-StringData (Get-Content "$envFile" -Raw)
  $cmBaseImageName = "$($platformEnv.SITECORE_DOCKER_REGISTRY)sitecore-$($Topology)-cm:$($platformEnv.SITECORE_VERSION)"

  $envVars.CM_BASE_IMAGE = $cmBaseImageName
  $envVars.HRZ_BASE_IMAGE = "ideftdevacr.azurecr.io/base/aspnet:6.0-nanoserver-1809"
  $envVars.TOPOLOGY = $Topology
  $envVars.GetEnumerator() | ForEach-Object { "$($_.Name)=$($_.Value)" } | Out-String | Out-File $envFile -Encoding default
  Write-Host "Base Image for HRZ runnable : $($envVars.HRZ_BASE_IMAGE)"

  #install UTF.WebHelperService
  $utfPath = "$DockerComposeDestination\cm\utf"
  $utfNugetPackagePath = $utfPath + "\package"
  $adsRoot = Get-AdsRoot
  nuget install UTF.WebService -prerelease -Source https://nuget1dk1/nuget/Tools/ -OutputDirectory $utfNugetPackagePath | Out-Null
  Get-ChildItem -Path $utfNugetPackagePath -Include HelperWebService.asmx, UTF.HelperWebService.dll -Recurse | Copy-Item -Destination $utfPath -Force
  $proxyFiles = Get-ChildItem -Path $adsRoot -Include proxy.asmx, ps.ads.proxy.dll -Recurse
  $proxyFiles | Copy-Item -Destination $utfPath -Force

  #Download starterkit and prepare context for jss image
  Push-Location "$DockerComposeDestination\jsshost"
  Invoke-CommandErrorsHandled { Invoke-Expression ( "git clone https://github.com/sitecorelabs/xmcloud-foundation-head-staging.git" ) }
  Copy-Item "CustomComponent.tsx" "xmcloud-foundation-head-staging\headapps\nextjs-starter\src\components" -Recurse -Force
  Set-Location ..
  Write-Host "---- Start building images ----" -ForegroundColor Cyan
  #build images

  Invoke-CommandThrowErrors { docker-compose -f .\docker-compose.yml build cm-with-utf, hrz, jsshost --memory 4GB }
  # Just keeping this for time being until the new script is ready
  # Invoke-CommandThrowErrors { docker-compose -f .\docker-compose.nocm.yml build --memory 2GB }

  Pop-Location
}

function Add-HostHeader {
    [CmdletBinding()]
    param (
        [string]$Hostname
    )

    $IPAddress = "127.0.0.1"
    $hosts = Join-Path -Path $($env:windir) -ChildPath "system32\drivers\etc\hosts"
    if (-not (Test-Path -Path $hosts)) {
        Throw "Hosts file not found"
    }

    Write-Host "Updating the hosts file $hosts with $Hostname ($IPAddress)"
    Remove-HostHeader $Hostname
    $nl = [Environment]::NewLine
    $data = Get-Content -Path $hosts
    $data += $nl + "$IPAddress`t$Hostname"
    $Utf8NoBomEncoding = New-Object System.Text.UTF8Encoding($False)
    [System.IO.File]::WriteAllLines($hosts, $data, $Utf8NoBomEncoding)

    Write-Host "Hosts file $hosts has been updated."
}

Function Remove-HostHeader {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory = $true, helpmessage = "Hostname")]
        [alias("header")]
        [ValidateNotNullOrEmpty()]
        [string]$Hostname
    )

    $hosts = Join-Path -Path $($env:windir) -ChildPath "system32\drivers\etc\hosts"
    if (-not (Test-Path -Path $hosts)) {
        Throw "Hosts file not found"
    }
    Write-Host "Removing content from hosts file $hosts"
    $c = (Get-Content $hosts)
    $newLines = @()

    foreach ($line in $c) {
        $bits = $line.Split("`t")
        if ($bits.count -eq 2) {
            if ($bits[1] -ne $Hostname) {
                $newLines += $line
            }
        } elseif ($line -ne "") {
            $newLines += $line
        }
    }

    Write-Host "Writing file with WriteAllLines."
    $Utf8NoBomEncoding = New-Object System.Text.UTF8Encoding($False)
    [System.IO.File]::WriteAllLines($hosts, $newLines, $Utf8NoBomEncoding)
    Write-Host "Content from hosts file $hosts has been removed."
}
