Add-Type -AssemblyName System.IO.Compression.FileSystem
$zip = [System.IO.Compression.ZipFile]::OpenRead('C:\Users\jscha\Downloads\Repo Big Tech Review.docx')
$entry = $zip.Entries | Where-Object { $_.FullName -eq 'word/document.xml' }
$stream = $entry.Open()
$reader = New-Object System.IO.StreamReader($stream)
$xml = $reader.ReadToEnd()
$reader.Close()
$stream.Close()
$zip.Dispose()
$text = $xml -replace '<[^>]+>', ' ' -replace '\s+', ' '
$outPath = 'C:\Users\jscha\.gemini\antigravity-ide\brain\e6f17577-2b9b-4e29-88da-e6aaf9b3989e\scratch\bigtech_review.txt'
Set-Content -Path $outPath -Value $text -Encoding UTF8
Write-Output "Extracted $($text.Length) chars"
