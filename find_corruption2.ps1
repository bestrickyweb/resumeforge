$bytes = Get-Content components/dashboard/checkin-modal.tsx -Encoding Byte

Write-Host "=== checkin-modal.tsx ==="
Write-Host "Total bytes: $($bytes.Count)"

# Check for U+FFFD
for($i=0; $i -lt $bytes.Count-2; $i++) {
    if($bytes[$i] -eq 0xEF -and $bytes[$i+1] -eq 0xBF -and $bytes[$i+2] -eq 0xBD) {
        Write-Host "U+FFFD at byte index $i"
    }
}

# Check for middle dot
for($i=0; $i -lt $bytes.Count-1; $i++) {
    if($bytes[$i] -eq 0xC2 -and $bytes[$i+1] -eq 0xB7) {
        Write-Host "Middle dot (0xC2 0xB7) at byte index $i"
    }
}

# Check for smart quotes
for($i=0; $i -lt $bytes.Count-2; $i++) {
    if($bytes[$i] -eq 0xE2 -and $bytes[$i+1] -eq 0x80) {
        if($bytes[$i+2] -eq 0x9C -or $bytes[$i+2] -eq 0x9D -or $bytes[$i+2] -eq 0x98 -or $bytes[$i+2] -eq 0x99) {
            Write-Host "Smart quote at byte index $i"
        }
    }
}

# Check for em-dash
for($i=0; $i -lt $bytes.Count-2; $i++) {
    if($bytes[$i] -eq 0xE2 -and $bytes[$i+1] -eq 0x80 -and $bytes[$i+2] -eq 0x94) {
        Write-Host "Em-dash at byte index $i"
    }
}

# Check for bullet
for($i=0; $i -lt $bytes.Count-2; $i++) {
    if($bytes[$i] -eq 0xE2 -and $bytes[$i+1] -eq 0x80 -and $bytes[$i+2] -eq 0xA2) {
        Write-Host "Bullet at byte index $i"
    }
}

# Check for any non-ASCII bytes
Write-Host "Non-ASCII bytes:"
for($i=0; $i -lt $bytes.Count; $i++) {
    if($bytes[$i] -gt 0x7F) {
        $h = $bytes[$i].ToString('X2')
        Write-Host ("Byte {0}: 0x{1}" -f $i, $h)
    }
}