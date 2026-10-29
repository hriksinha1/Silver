$ErrorActionPreference = 'Stop'

$scriptDirectory = Split-Path -Parent $MyInvocation.MyCommand.Path
$functionDirectory = Split-Path -Parent $scriptDirectory
$repositoryRoot = Split-Path -Parent (Split-Path -Parent $functionDirectory)

$secureApiKey = Read-Host 'Enter the short-lived Appwrite API key (input is hidden)' -AsSecureString
$apiKeyPointer = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($secureApiKey)

try {
  $env:APPWRITE_ENDPOINT = 'https://sgp.cloud.appwrite.io/v1'
  $env:APPWRITE_PROJECT_ID = '6ae2df98002eb5a1a39b'
  $env:APPWRITE_API_KEY = [Runtime.InteropServices.Marshal]::PtrToStringBSTR($apiKeyPointer)

  Push-Location $repositoryRoot
  try {
    npm run provision:database --prefix .\functions\storefront
    if ($LASTEXITCODE -ne 0) {
      throw "Appwrite provisioning failed with exit code $LASTEXITCODE."
    }
  }
  finally {
    Pop-Location
  }
}
finally {
  Remove-Item Env:APPWRITE_API_KEY -ErrorAction SilentlyContinue
  Remove-Item Env:APPWRITE_ENDPOINT -ErrorAction SilentlyContinue
  Remove-Item Env:APPWRITE_PROJECT_ID -ErrorAction SilentlyContinue
  [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($apiKeyPointer)
  $secureApiKey.Dispose()
}
