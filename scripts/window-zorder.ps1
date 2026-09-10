param([long]$Floating, [long]$Competitor)
Add-Type @'
using System;
using System.Runtime.InteropServices;
public static class WinZ {
  [DllImport("user32.dll")] public static extern IntPtr GetWindow(IntPtr hWnd, uint uCmd);
  [DllImport("user32.dll")] public static extern IntPtr GetTopWindow(IntPtr hWnd);
}
'@
$cursor = [WinZ]::GetTopWindow([IntPtr]::Zero)
while ($cursor -ne [IntPtr]::Zero) {
  if ($cursor.ToInt64() -eq $Floating) { Write-Output 'floating'; exit 0 }
  if ($cursor.ToInt64() -eq $Competitor) { Write-Output 'competitor'; exit 0 }
  $cursor = [WinZ]::GetWindow($cursor, 2)
}
throw 'Windows not found in z-order'
