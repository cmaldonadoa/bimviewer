<?php
use PhpOffice\PhpSpreadsheet\IOFactory;
use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Style\Alignment;
use PhpOffice\PhpSpreadsheet\Style\Border;
use PhpOffice\PhpSpreadsheet\Style\Color;
use PhpOffice\PhpSpreadsheet\Style\Fill;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;

require_once __DIR__ . '/vendor/phpoffice/phpspreadsheet/src/Bootstrap.php';

// Dictionaries
$type_color = json_decode(file_get_contents("dicts/type_color.json"), true);
$entity_type = json_decode(file_get_contents("dicts/entity_type.json"), true);

// Styles
$hyperlink_style = [
  'font' => ['color' => array('rgb' => '3333FF'), 'underline' => true]
];

$headers_style = [
  'font' => ['bold' => true],
  'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER],
  'borders' => ['top' => ['borderStyle' => Border::BORDER_MEDIUM]]
];

$odd_row_style = [
  'fill' => [
    'fillType' => Fill::FILL_SOLID,
    'startColor' => [
      'argb' => 'FFD9D9D9'
    ]
  ]
];

function createIfcSheet(&$spreadsheet, $data, $key, $index)
{
  global $entity_type,
    $type_color,
    $hyperlink_style,
    $headers_style,
    $odd_row_style;

  $this_data = $data[$key];
  $headers = array("ID");
  $row = 3;
  $col_i = 0;
  $col_letters = range('A', 'Z');
  $spreadsheet->createSheet();
  $spreadsheet->setActiveSheetIndex($index);

  $spreadsheet
    ->getActiveSheet()
    ->setCellValue("{$col_letters[$col_i++]}2", "ID");

  // Summary hyperlink
  $spreadsheet
    ->getActiveSheet()
    ->setCellValue("A1", "Summary")
    ->getCell("A1")
    ->getHyperlink()
    ->setUrl("sheet://'Summary'!A1");

  $spreadsheet
    ->getActiveSheet()
    ->getStyle('A1')
    ->applyFromArray($hyperlink_style);

  // Write data
  foreach ($this_data as $idx => $entity) {
    $attributes = $entity["attributes"];
    foreach ($attributes as $property => $value) {
      // If property not in headers, append to the next column of row 2
      if (!in_array($property, $headers)) {
        array_push($headers, $property);
        $spreadsheet
          ->getActiveSheet()
          ->setCellValue("{$col_letters[$col_i++]}2", $property);
      }

      // Set values of each property in the current rows
      $pos = array_search($property, $headers);
      $cell = $col_letters[$pos] . $row;
      $spreadsheet
        ->getActiveSheet()
        ->setCellValue($cell, wordwrap((string) $value));

      // Format cell
      $spreadsheet
        ->getActiveSheet()
        ->getStyle($cell)
        ->getAlignment()
        ->setWrapText(true)
        ->setHorizontal(Alignment::HORIZONTAL_LEFT)
        ->setVertical(Alignment::VERTICAL_TOP);
    }

    $parent_id = intval($entity["parentID"]);
    if ($parent_id > 0) {
      // Write header
      if (!in_array("HasParent", $headers)) {
      array_push($headers, "HasParent");
      $spreadsheet
        ->getActiveSheet()
        ->setCellValue("{$col_letters[$col_i++]}2", "HasParent");
      }

      // Write content
      $pos = array_search("HasParent", $headers);
      $cell = $col_letters[$pos] . $row;
      $spreadsheet
        ->getActiveSheet()
        ->setCellValue($cell, wordwrap("{$entity['parentType']} {$parent_id}"));

      // Format cell
      $spreadsheet
        ->getActiveSheet()
        ->getStyle($cell)
        ->getAlignment()
        ->setWrapText(true)
        ->setHorizontal(Alignment::HORIZONTAL_LEFT)
        ->setVertical(Alignment::VERTICAL_TOP);
    }
    $row++;
  }

  // Format cells style
  foreach (range(0, $col_i - 1) as $idx => $i) {
    $spreadsheet
      ->getActiveSheet()
      ->getColumnDimension($col_letters[$i])
      ->setAutoSize(true);

    $spreadsheet
      ->getActiveSheet()
      ->getStyle("{$col_letters[$i]}2")
      ->applyFromArray($headers_style);

    foreach (range(3, $row - 1) as $idx2 => $j) {
      if ($j % 2 == 1) {
        $spreadsheet
          ->getActiveSheet()
          ->getStyle("{$col_letters[$i]}{$j}")
          ->applyFromArray($odd_row_style);
      }
    }
  }

  // Style last row
  $spreadsheet
    ->getActiveSheet()
    ->getStyle("A{$row}:{$col_letters[$col_i - 1]}{$row}")
    ->getBorders()
    ->getTop()
    ->setBorderStyle(Border::BORDER_MEDIUM);

  // Style sheet tab
  $type = array_key_exists($key, $entity_type)
    ? $entity_type[$key]
    : "untracked";
  $color = array_key_exists($type, $type_color)
    ? $type_color[$type]
    : "FFCCCCCC";
  $spreadsheet->getActiveSheet()->setTitle($key);

  $spreadsheet
    ->getActiveSheet()
    ->getTabColor()
    ->setARGB($color);

  // Set filter to headers
  $spreadsheet
    ->getActiveSheet()
    ->setAutoFilter("A2:{$col_letters[$col_i - 1]}2");

  // Freeze headers
  $spreadsheet->getActiveSheet()->freezePane("A3");
}

function createSummary(&$spreadsheet, $data)
{
  global $entity_type, $type_color, $hyperlink_style, $headers_style;

  // Format XLS
  $spreadsheet
    ->setActiveSheetIndex(0)
    ->getColumnDimension('A')
    ->setAutoSize(true);

  // Headers
  $spreadsheet
    ->getActiveSheet()
    ->setCellValue('A1', 'Entity')
    ->setCellValue('B1', 'Count');

  // Hyperlinks
  $spreadsheet
    ->getActiveSheet()
    ->getStyle('A1:B1')
    ->applyFromArray($headers_style);

  // Data count
  $row_counter = 2;
  foreach ($data as $key => $value) {
    $type = array_key_exists($key, $entity_type)
      ? $entity_type[$key]
      : "untracked";
    $color = array_key_exists($type, $type_color)
      ? $type_color[$type]
      : "FFCCCCCC";

    // Set hyperlink to entity name
    $spreadsheet
      ->getActiveSheet()
      ->setCellValue("A{$row_counter}", $key)
      ->getCell("A{$row_counter}")
      ->getHyperlink()
      ->setUrl("sheet://'{$key}'!A1");

    $spreadsheet
      ->getActiveSheet()
      ->getStyle("A{$row_counter}")
      ->applyFromArray($hyperlink_style);

    // Set entity color
    $spreadsheet
      ->getActiveSheet()
      ->getStyle("A{$row_counter}")
      ->getFill()
      ->setFillType(Fill::FILL_SOLID);

    $spreadsheet
      ->getActiveSheet()
      ->getStyle("A{$row_counter}")
      ->getFill()
      ->getStartColor()
      ->setARGB($color);

    // Set count number
    $spreadsheet
      ->getActiveSheet()
      ->setCellValue("B{$row_counter}", (string) count($value));

    $row_counter++;
  }

  // Style last row
  $spreadsheet
    ->getActiveSheet()
    ->getStyle("A{$row_counter}:B{$row_counter}")
    ->getBorders()
    ->getTop()
    ->setBorderStyle(Border::BORDER_MEDIUM);

  // Rename sheet
  $spreadsheet->getActiveSheet()->setTitle('Summary');

  $spreadsheet->getActiveSheet()->freezePane("A2");
}

function writeSpreadsheet($data, $filename)
{
  $spreadsheet = new Spreadsheet();
  createSummary($spreadsheet, $data);

  // Write ifc entities sheets
  $index = 1;
  foreach ($data as $key => $value) {
    createIfcSheet($spreadsheet, $data, $key, $index++);
  }
  $spreadsheet->setActiveSheetIndex(0);

  // Redirect output to a client’s web browser (Xls)
  header(
    'Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  );
  header('Content-Disposition: attachment; filename="' . $filename . '.xlsx"');
  header('Cache-Control: max-age=0');


  ob_start();
  $writer = IOFactory::createWriter($spreadsheet, 'Xlsx');
  $writer->save('php://output');
  $xlsData = ob_get_contents();
  ob_end_clean();
  $response =  array(
        'op' => 'ok',
        'file' => "data:application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;base64,".base64_encode($xlsData)
    );

  die(json_encode($response));
}
?>
