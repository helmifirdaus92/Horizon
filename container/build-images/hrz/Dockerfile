# escape=`

ARG BASE_IMAGE

FROM ${BASE_IMAGE}

USER ContainerAdministrator

WORKDIR C:\Horizon

COPY .\horizonArtifacts .\

EXPOSE 80

ENTRYPOINT [ "dotnet.exe", ".\\Sitecore.Horizon.Host.dll" ]