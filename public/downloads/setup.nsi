; Trade Hybrid NinjaTrader Adapter Installer Script
; NSIS (Nullsoft Scriptable Install System) script

!include "MUI2.nsh"

; General
Name "Trade Hybrid NinjaTrader Adapter"
OutFile "TradeHybrid_NinjaTrader_Adapter_Setup.exe"
Unicode True
InstallDir "$PROGRAMFILES\Trade Hybrid\NinjaTrader Adapter"
InstallDirRegKey HKCU "Software\Trade Hybrid\NinjaTrader Adapter" ""
RequestExecutionLevel admin

; Interface Settings
!define MUI_ABORTWARNING
!define MUI_ICON "${NSISDIR}\Contrib\Graphics\Icons\modern-install.ico"
!define MUI_UNICON "${NSISDIR}\Contrib\Graphics\Icons\modern-uninstall.ico"
!define MUI_HEADERIMAGE
!define MUI_HEADERIMAGE_BITMAP "${NSISDIR}\Contrib\Graphics\Header\win.bmp"
!define MUI_WELCOMEFINISHPAGE_BITMAP "${NSISDIR}\Contrib\Graphics\Wizard\win.bmp"

; Pages
!insertmacro MUI_PAGE_WELCOME
!insertmacro MUI_PAGE_LICENSE "license.txt"
!insertmacro MUI_PAGE_DIRECTORY
!insertmacro MUI_PAGE_INSTFILES
!insertmacro MUI_PAGE_FINISH

!insertmacro MUI_UNPAGE_CONFIRM
!insertmacro MUI_UNPAGE_INSTFILES

; Languages
!insertmacro MUI_LANGUAGE "English"

; Installer Sections
Section "Install"
  SetOutPath "$INSTDIR"
  
  ; Files to install
  File "TradeHybrid_NinjaTrader_Adapter.dll"
  File "README.txt"
  
  ; Create uninstaller
  WriteUninstaller "$INSTDIR\Uninstall.exe"
  
  ; Create shortcuts
  CreateDirectory "$SMPROGRAMS\Trade Hybrid"
  CreateShortcut "$SMPROGRAMS\Trade Hybrid\NinjaTrader Adapter.lnk" "$INSTDIR\TradeHybrid_NinjaTrader_Adapter.exe"
  CreateShortcut "$SMPROGRAMS\Trade Hybrid\Uninstall.lnk" "$INSTDIR\Uninstall.exe"
  CreateShortcut "$DESKTOP\Trade Hybrid NinjaTrader Adapter.lnk" "$INSTDIR\TradeHybrid_NinjaTrader_Adapter.exe"
  
  ; Registry entries
  WriteRegStr HKCU "Software\Trade Hybrid\NinjaTrader Adapter" "" $INSTDIR
  WriteRegStr HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\TradeHybridNinjaTraderAdapter" "DisplayName" "Trade Hybrid NinjaTrader Adapter"
  WriteRegStr HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\TradeHybridNinjaTraderAdapter" "UninstallString" "$\"$INSTDIR\Uninstall.exe$\""
  WriteRegStr HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\TradeHybridNinjaTraderAdapter" "DisplayIcon" "$INSTDIR\TradeHybrid_NinjaTrader_Adapter.exe"
  WriteRegStr HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\TradeHybridNinjaTraderAdapter" "Publisher" "Trade Hybrid"
  WriteRegStr HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\TradeHybridNinjaTraderAdapter" "DisplayVersion" "1.0.0"
  
  ; Check if NinjaTrader is installed and configure integration
  ReadRegStr $0 HKLM "Software\NinjaTrader 8" "InstallDir"
  ${If} $0 != ""
    SetOutPath "$0\bin\Custom"
    File "TradeHybrid_NinjaTrader_Adapter.dll"
    MessageBox MB_OK "NinjaTrader 8 detected. Adapter installed successfully."
  ${Else}
    MessageBox MB_OK "NinjaTrader 8 not detected. You will need to manually copy the adapter DLL to your NinjaTrader installation."
  ${EndIf}
SectionEnd

; Uninstaller Section
Section "Uninstall"
  ; Remove files
  Delete "$INSTDIR\TradeHybrid_NinjaTrader_Adapter.dll"
  Delete "$INSTDIR\README.txt"
  Delete "$INSTDIR\Uninstall.exe"
  
  ; Remove shortcuts
  Delete "$SMPROGRAMS\Trade Hybrid\NinjaTrader Adapter.lnk"
  Delete "$SMPROGRAMS\Trade Hybrid\Uninstall.lnk"
  Delete "$DESKTOP\Trade Hybrid NinjaTrader Adapter.lnk"
  RMDir "$SMPROGRAMS\Trade Hybrid"
  
  ; Remove install directory
  RMDir "$INSTDIR"
  
  ; Remove registry entries
  DeleteRegKey HKCU "Software\Trade Hybrid\NinjaTrader Adapter"
  DeleteRegKey HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\TradeHybridNinjaTraderAdapter"
  
  ; Try to remove from NinjaTrader directory
  ReadRegStr $0 HKLM "Software\NinjaTrader 8" "InstallDir"
  ${If} $0 != ""
    Delete "$0\bin\Custom\TradeHybrid_NinjaTrader_Adapter.dll"
  ${EndIf}
SectionEnd