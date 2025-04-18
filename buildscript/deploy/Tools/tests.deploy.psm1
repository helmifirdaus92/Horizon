Set-StrictMode -Version 2.0

Function Invoke-GetConnectionStringConfigFunction {
    param(
        [Parameter(Mandatory = $true)]
        [string]$ConfigPath,
        [Parameter(Mandatory = $true)]
        [string]$StrName
    )

    [xml]$config = Get-Content $ConfigPath
	return $config.DocumentElement.SelectSingleNode("add[@name='$StrName']").connectionString
}

Register-SitecoreInstallExtension -Command Invoke-GetConnectionStringConfigFunction -As getcsconfig -Type ConfigFunction
