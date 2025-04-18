Set-StrictMode -Version 2.0


Function Invoke-ResolveHostDomain {
    [CmdletBinding(SupportsShouldProcess = $true)]
    param()
    $currentHost = [System.Net.DNS]::GetHostByName('').HostName
    Write-Host "Host suffix is resolved to be: $currentHost" -foregroundcolor "DarkYellow"
    return $currentHost.ToLowerInvariant()
}

Register-SitecoreInstallExtension -Command Invoke-ResolveHostDomain -As ResolveHostDomain -Type ConfigFunction
