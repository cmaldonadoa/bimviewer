<?php
$json = json_decode(file_get_contents('php://input'), true);

$file_path = "../../models/" . $json["folder"] . "/" . $json["filename"] . ".json";
$fp = fopen($file_path, 'w');
chmod($file_path, 0777);
fwrite($fp, json_encode($json["annotations"]));
fclose($fp);
?>
