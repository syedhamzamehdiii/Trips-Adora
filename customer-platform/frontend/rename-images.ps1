# PowerShell script to rename image files with spaces
$basePath = Join-Path $PSScriptRoot "public\images"
Set-Location $basePath

Write-Host "Renaming image files with spaces..."

# List of renames: old name, new name
$renames = @(
    @("place 1.jpg", "place-1.jpg"),
    @("place 2.jpg", "place-2.jpg"),
    @("place 3.jpg", "place-3.jpg"),
    @("core values.jpg", "core-values.jpg"),
    @("mount fuji.jpg", "mount-fuji.jpg"),
    @("Screenshot 2025-11-03 at 12.08.32 PM.png", "tokyo-skytree-1.png"),
    @("Screenshot 2025-11-03 at 12.12.27 PM.png", "tokyo-tower-1.png"),
    @("Screenshot 2025-11-03 at 12.13.07 PM.png", "arashiyama-bamboo-1.png"),
    @("golden-pavilion-kinkakuji-temple-kyoto-japan 1.png", "golden-pavilion-kinkakuji-temple-kyoto-japan-1.png"),
    @("tourist-looking-fuji-mountain-cherry-blossom-spring-fujinomiya-japan 2 (1).png", "tourist-looking-fuji-mountain-cherry-blossom-spring-fujinomiya-japan-2-1.png"),
    @("tower ...jpg", "tower.jpg")
)

$renamed = 0
foreach ($rename in $renames) {
    $oldName = $rename[0]
    $newName = $rename[1]
    $oldPath = Join-Path $basePath $oldName
    if (Test-Path $oldPath) {
        try {
            Rename-Item -Path $oldPath -NewName $newName -Force
            Write-Host "Renamed: $oldName -> $newName"
            $renamed++
        } catch {
            Write-Host "Failed to rename: $oldName"
        }
    } else {
        Write-Host "File not found: $oldName"
    }
}

Write-Host ""
Write-Host "Renamed $renamed files successfully!"
$fileCount = (Get-ChildItem -File).Count
Write-Host "Total files in public/images/: $fileCount"
