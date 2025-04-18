# escape=`

ARG JSS_BASE_IMAGE
FROM ${JSS_BASE_IMAGE}

ARG NODEJS_VERSION

SHELL ["powershell", "-Command", "$ErrorActionPreference = 'Stop'; $ProgressPreference = 'SilentlyContinue';"]
USER ContainerAdministrator
RUN Invoke-WebRequest -OutFile C:\nodejs.zip -UseBasicParsing "https://nodejs.org/dist/v$env:NODEJS_VERSION/node-v$env:NODEJS_VERSION-win-x64.zip"; `
    Expand-Archive C:\nodejs.zip -DestinationPath C:\; `
    Rename-Item "C:\\node-v$env:NODEJS_VERSION-win-x64" C:\nodejs; `
    Remove-Item C:\nodejs.zip;

RUN [Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12; `
	Invoke-WebRequest "https://aka.ms/vs/17/release/vc_redist.x64.exe" -OutFile "vc_redist.x64.exe"; `
	Start-Process -filepath C:\vc_redist.x64.exe -ArgumentList "/install", "/passive", "/norestart" -Passthru | Wait-Process; `
	Remove-Item -Force vc_redist.x64.exe;


RUN setx /M PATH $($Env:PATH + ';C:\nodejs')
ENV NODE_OPTIONS=--max_old_space_size=4096
RUN npm config set registry https://registry.npmjs.org/

RUN npm cache clean --force
WORKDIR c:\app

COPY .\xmcloud-foundation-head-staging\headapps\nextjs-starter C:\app

ENV NODE_TLS_REJECT_UNAUTHORIZED=0

EXPOSE 3000
RUN npm install
ENTRYPOINT npm run start:production
