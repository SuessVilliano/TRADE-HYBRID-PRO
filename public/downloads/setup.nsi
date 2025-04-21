; Trade Hybrid NinjaTrader Adapter Installer Script
; NSIS (Nullsoft Scriptable Install System) script

; Define constants
!define PRODUCT_NAME "Trade Hybrid NinjaTrader Adapter"
!define PRODUCT_VERSION "1.0.0"
!define PRODUCT_PUBLISHER "Trade Hybrid"
!define PRODUCT_WEB_SITE "https://tradehybrid.com"
!define PRODUCT_DIR_REGKEY "Software\Microsoft\Windows\CurrentVersion\App Paths\NinjaTraderAdapter.exe"
!define PRODUCT_UNINST_KEY "Software\Microsoft\Windows\CurrentVersion\Uninstall\${PRODUCT_NAME}"
!define PRODUCT_UNINST_ROOT_KEY "HKLM"

; Modern UI
!include "MUI2.nsh"

; Set the output file name
OutFile "TradeHybrid_NinjaTrader_Adapter_Setup.exe"

; Default installation directory
InstallDir "$PROGRAMFILES\Trade Hybrid\NinjaTrader Adapter"

; Request application privileges for Windows Vista and higher
RequestExecutionLevel admin

; MUI Settings
!define MUI_ABORTWARNING
!define MUI_ICON "${NSISDIR}\Contrib\Graphics\Icons\modern-install.ico"
!define MUI_UNICON "${NSISDIR}\Contrib\Graphics\Icons\modern-uninstall.ico"
!define MUI_WELCOMEFINISHPAGE_BITMAP "${NSISDIR}\Contrib\Graphics\Wizard\win.bmp"
!define MUI_HEADERIMAGE
!define MUI_HEADERIMAGE_BITMAP "${NSISDIR}\Contrib\Graphics\Header\win.bmp"
!define MUI_COMPONENTSPAGE_SMALLDESC

; Welcome page
!insertmacro MUI_PAGE_WELCOME

; License page
!insertmacro MUI_PAGE_LICENSE "license.txt"

; Directory page
!insertmacro MUI_PAGE_DIRECTORY

; Instfiles page
!insertmacro MUI_PAGE_INSTFILES

; Finish page
!define MUI_FINISHPAGE_RUN "$INSTDIR\NinjaTraderAdapter.exe"
!insertmacro MUI_PAGE_FINISH

; Uninstaller pages
!insertmacro MUI_UNPAGE_CONFIRM
!insertmacro MUI_UNPAGE_INSTFILES

; Language files
!insertmacro MUI_LANGUAGE "English"

; Main install section
Section "MainSection" SEC01
  SetOutPath "$INSTDIR"
  SetOverwrite ifnewer
  
  ; Add program files
  File "NinjaTraderAdapter.exe"
  File "NinjaTraderAdapter.exe.config"
  File "Newtonsoft.Json.dll"
  File "WebSocketSharp.dll"
  File "icon.ico"
  
  ; Create start menu shortcuts
  CreateDirectory "$SMPROGRAMS\Trade Hybrid"
  CreateShortCut "$SMPROGRAMS\Trade Hybrid\NinjaTrader Adapter.lnk" "$INSTDIR\NinjaTraderAdapter.exe"
  CreateShortCut "$DESKTOP\Trade Hybrid NinjaTrader Adapter.lnk" "$INSTDIR\NinjaTraderAdapter.exe"
  
  ; Write uninstaller information to registry
  WriteUninstaller "$INSTDIR\uninst.exe"
  WriteRegStr HKLM "${PRODUCT_DIR_REGKEY}" "" "$INSTDIR\NinjaTraderAdapter.exe"
  WriteRegStr ${PRODUCT_UNINST_ROOT_KEY} "${PRODUCT_UNINST_KEY}" "DisplayName" "$(^Name)"
  WriteRegStr ${PRODUCT_UNINST_ROOT_KEY} "${PRODUCT_UNINST_KEY}" "UninstallString" "$INSTDIR\uninst.exe"
  WriteRegStr ${PRODUCT_UNINST_ROOT_KEY} "${PRODUCT_UNINST_KEY}" "DisplayIcon" "$INSTDIR\NinjaTraderAdapter.exe"
  WriteRegStr ${PRODUCT_UNINST_ROOT_KEY} "${PRODUCT_UNINST_KEY}" "DisplayVersion" "${PRODUCT_VERSION}"
  WriteRegStr ${PRODUCT_UNINST_ROOT_KEY} "${PRODUCT_UNINST_KEY}" "URLInfoAbout" "${PRODUCT_WEB_SITE}"
  WriteRegStr ${PRODUCT_UNINST_ROOT_KEY} "${PRODUCT_UNINST_KEY}" "Publisher" "${PRODUCT_PUBLISHER}"
SectionEnd

; Uninstaller section
Section Uninstall
  ; Remove files
  Delete "$INSTDIR\uninst.exe"
  Delete "$INSTDIR\NinjaTraderAdapter.exe"
  Delete "$INSTDIR\NinjaTraderAdapter.exe.config"
  Delete "$INSTDIR\Newtonsoft.Json.dll"
  Delete "$INSTDIR\WebSocketSharp.dll"
  Delete "$INSTDIR\icon.ico"
  
  ; Remove shortcuts
  Delete "$SMPROGRAMS\Trade Hybrid\NinjaTrader Adapter.lnk"
  Delete "$DESKTOP\Trade Hybrid NinjaTrader Adapter.lnk"
  RMDir "$SMPROGRAMS\Trade Hybrid"
  RMDir "$INSTDIR"
  
  ; Remove registry entries
  DeleteRegKey ${PRODUCT_UNINST_ROOT_KEY} "${PRODUCT_UNINST_KEY}"
  DeleteRegKey HKLM "${PRODUCT_DIR_REGKEY}"
SectionEnd