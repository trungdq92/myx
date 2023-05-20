$srcpth = 'assets/data'
$template = "template/index.html"
$dest = 'temp/'
function Out-Children{
    param($Path, $Dest, $Level = 1)
    Get-ChildItem -Path $Path -Directory | ForEach-Object {
        $relativePath = Resolve-Path $_.FullName -Relative
        $relativePath = $relativePath.remove(0, ($srcpth.length + 2))
        $name = $_.Name

        $path = "$Dest$name/"
        if (!(Test-Path $path)) {
            New-Item -ItemType Directory -Path $path -Force
        }

        if(($Level % 2) -eq 1){
            Copy-Item -Path $template -Destination "$path/index.html" -Recurse -Force
        }
    
        $prefixFolder = '';
        if($Level -eq 1){
            $prefixFolder = '/content'
        }
 
        if($Level -eq 3){
            $prefixFolder = '/detail'
        }

        if($Level -eq 7){
            $prefixFolder = '/chapter'
        }

        $path = "$Dest$name$prefixFolder/"
        Write-Host "$Level $path"
        

        if ($_.psiscontainer) {  
            Out-Children -Path $_.FullName -Dest $path -Level ($Level + 2) 
        }
    }
}

Out-Children  -Path $srcpth -Dest $dest


function Out-JsonChildren {
    param($Path, $Level = 1)
    return $(Get-ChildItem -Path $Path -Directory | Where-Object { $_ } | ForEach-Object {
            "{`n" + 
            "`"id`"`: `"$($_.Name)`"," + 
            "`n" +
            "`"name`"`: `"$($_.Name.replace('_',' '))`"," + 
            "`n" +
            "`"children`": [" + 
            $(if ($_.psiscontainer) { "`n" + (Out-JsonChildren -Path $_.FullName -Level ($Level + 2)) + "`n" }) +
            "]" + 
            "`n" +
            "}"
        }) -join ",`n"
}

$JSON = Out-JsonChildren -Path $srcpth
$data = "{`n " +
        "`"id`":`"myx`"," +
        "`n " +
        "`"name`":`"myx`"," +
        " `n " +
        "`"children`":[$JSON]" +
        " `n " +
        "}"

Out-File -FilePath "$srcpth\menu.json"  -InputObject $data -Force

