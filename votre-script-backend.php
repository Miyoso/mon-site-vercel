<?php
$uploadDirectory = 'uploads/';
if (!is_dir($uploadDirectory)) {
    mkdir($uploadDirectory, 0755, true);
}

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    
    $missionCode = htmlspecialchars($_POST['mission-code']);
    $summary = htmlspecialchars($_POST['report-summary']);

    echo "<!DOCTYPE html><html lang='fr'><head><meta charset='UTF-8'>";
    echo "<title>Statut Soumission</title>";
    echo "<style>
            body { font-family: 'IBM Plex Mono', monospace; background-color: #0d1117; color: #c9d1d9; padding: 2rem; }
            h1 { color: #39d353; }
            p { font-size: 1.1rem; }
            li { color: #8b949e; }
            li.success { color: #39d353; }
            li.error { color: #f85149; }
            a { color: #e3b341; font-weight: 700; text-decoration: none; margin-top: 2rem; display: inline-block; }
          </style>";
    echo "</head><body>";
    
    echo "<h1>RAPPORT DE SOUMISSION</h1>";
    echo "<p><strong>CODE MISSION:</strong> $missionCode</p>";
    echo "<p><strong>RÉSUMÉ TACTIQUE:</strong><br>" . nl2br($summary) . "</p>";

    if (isset($_FILES['file-upload'])) {
        $fileCount = count($_FILES['file-upload']['name']);
        echo "<h3>FICHIERS TRAITÉS ($fileCount):</h3><ul>";

        for ($i = 0; $i < $fileCount; $i++) {
            $fileName = $_FILES['file-upload']['name'][$i];
            $fileTmpName = $_FILES['file-upload']['tmp_name'][$i];
            $fileError = $_FILES['file-upload']['error'][$i];
            $safeFileName = basename($fileName);
            $destination = $uploadDirectory . $safeFileName;

            if ($fileError === UPLOAD_ERR_OK) {
                if (move_uploaded_file($fileTmpName, $destination)) {
                    echo "<li class='success'>SUCCÈS: " . htmlspecialchars($safeFileName) . " (téléchargé et sauvegardé)</li>";
                } else {
                    echo "<li class='error'>ERREUR: Échec du déplacement pour " . htmlspecialchars($safeFileName) . "</li>";
                }
            } elseif ($fileError == UPLOAD_ERR_NO_FILE) {
                 echo "<li>INFO: Aucun fichier n'a été soumis.</li>";
                 if ($fileCount == 1) break;
            } else {
                echo "<li class='error'>ERREUR: Problème lors du téléchargement de " . htmlspecialchars($fileName) . " (Code: $fileError)</li>";
            }
        }
        echo "</ul>";
    }

    echo "<a href='index.html'>[NOUVELLE SOUMISSION]</a>";
    echo "</body></html>";

} else {
    header('Location: index.html');
    exit;
}
?>