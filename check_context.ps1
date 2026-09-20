$bytes = Get-Content components/dashboard/roast-view.tsx -Encoding Byte
$context = 20
$idx = 4234
for($i=$idx-$context; $i -lt $idx+$context+3; $i++) {
    if($i -ge 0 -and $i -lt $bytes.Count) {
        $h = $bytes[$i].ToString('X2')
        $c = [char]$bytes[$i]
        Write-Host ("{0}: 0x{1} ({2})" -f $i, $h, $c)
    }
}