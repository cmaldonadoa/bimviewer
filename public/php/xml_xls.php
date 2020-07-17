<?php
ini_set("memory_limit", "2000M");
ini_set("max_execution_time", "1800");
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

require_once 'xls_writer.php';

$input = json_decode(file_get_contents('php://input'), true);
$json_path = "../models/{$_POST["folder"]}/{$_POST["filename"]}_type.json";
$json = json_decode(file_get_contents($json_path), true);
ksort($json);
$json_path = "../models/{$_POST["folder"]}/{$_POST["filename"]}_id.json";
$ids = json_decode(file_get_contents($json_path), true);

// Reorder hash map
$final_data = array();
$entity_type = json_decode(file_get_contents("dicts/entity_type.json"), true);
$order = [
  "building elements" => array(),
  "material" => array(),
  "property" => array(),
  "relationship" => array(),
  "representation" => array(),
  "building services" => array(),
  "profile" => array(),
  "hvac" => array(),
  "electrical" => array(),
  "structural analysis" => array(),
  "presentation" => array(),
  "quantity" => array(),
  "geometry" => array(),
  "unit" => array(),
  "other" => array(),
  "untracked" => array()
];

foreach ($json as $entity => $data) {
  $type = array_key_exists($entity, $entity_type)
    ? $entity_type[$entity]
    : "untracked";
  
  $formatted_data = array();
  foreach ($data as $key => $value) {
    if (array_key_exists("parentGUID", $value)) {
      $parent = $value["parentGUID"];
      if (array_key_exists($parent, $ids) && array_key_exists("type", $ids[$parent])) {
        $parent_type = $ids[$parent]["type"];
        $value["parentType"] = $parent_type;        
      } else {
        $value["parentType"] = null; 
      }     
    } else {
      $value["parentType"] = null; 
    }
    $formatted_data[$key] = $value;
  }
  array_push($order[$type], [$entity => $formatted_data]);
}

foreach ($order as $type => $array) {
  foreach ($array as $idx => $value) {
    foreach ($value as $fkey => $data) {
      $final_data[$fkey] = $data;
    }
  }
}

writeSpreadsheet($final_data, $input["filename"]);

?>
