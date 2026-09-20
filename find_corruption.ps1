$bytes = Get-Content components/dashboard/roast-view.tsx -Encoding Byte
for($i=0; $i -lt $bytes.Count-2; $i++) {
    if($bytes[$i] -eq 0xEF -and $bytes[$i+1] -eq 0xBF -and $bytes[$i+2] -eq 0xBD) {
        Write-Host "roast-view.tsx: Found U+FFFD at byte index $i"
    }
}

$bytes = Get-Content components/dashboard/checkin-modal.tsx -Encoding Byte
for($i=0; $i -lt $bytes.Count-2; $i++) {
    if($bytes[$i] -eq 0xEF -and $bytes[$i+1] -eq 0xBF -and $bytes[$i+2] -eq 0xBD) {
        Write-Host "checkin-modal.tsx: Found U+FFFD at byte index $i"
    }
}

$bytes = Get-Content components/dashboard/pipeline-intelligence.tsx -Encoding Byte
for($i=0; $i -lt $bytes.Count-1; $i++) {
    if($bytes[$i] -eq 0xC2 -and $bytes[$i+1] -eq 0xB7) {
        Write-Host "pipeline-intelligence.tsx: Found middle dot (0xC2 0xB7) at byte index $i"
    }
}
for($i=0; $i -lt $bytes.Count-2; $i++) {
    if($bytes[$i] -eq 0xEF -and $bytes[$i+1] -eq 0xBF -and $bytes[$i+2] -eq 0xBD) {
        Write-Host "pipeline-intelligence.tsx: Found U+FFFD at byte index $i"
    }
}