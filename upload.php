<?php
require_once('php/util.php');
require_once('php/encrypt.php');

ini_set('upload_max_filesize', '500M');
ini_set('post_max_size', '500M');
ini_set('max_input_time', 60*60);
ini_set('max_execution_time', 60*60);

$log = fopen("/var/www/logs/temp.log", "w");

function checkErrors() {
  $errors = array();
  foreach($_FILES as $name => $value) {
    if($value["error"] != 0) {
      $errors[$name] = $value["error"];
    }
  }
  return empty($errors) ? false : $errors;
}

function handleUpload($log) {
  fwrite($log, "FILES: ");
  fwrite($log, var_export($_FILES, true));
  fwrite($log, "\n");
  foreach($_FILES as $name => $value) {
    $filename = basename($value["name"]);
    $experiment_id = isset($_POST['experiment_id']) ? $_POST['experiment_id'] : 'null_exp_id';
    $user_id = isset($_POST['user_id']) ? $_POST['user_id'] : 'null_user_id';
    $dest = getUploadSavePath($experiment_id, $user_id, $filename);
    fwrite($log, "Maving $filename to $dest\n");
    if(move_uploaded_file($value["tmp_name"], $dest)) {
      if(encrypt($experiment_id, $user_id, $filename)) {
	unlink($dest);
	fwrite($log, "File Moved to $dest and encrypted\n");
      } else {
	fwrite($log, "File Moved to $dest but not encrypted\n");
      }
    } else {
      fwrite($log, "Error: A problem occurred while uploading to $dest\n");
    }
  }
}

fwrite($log, "STORT LOGGING\n");

$err = checkErrors();
if(!$err) {
  fwrite($log, "no errors:\n");
  handleUpload($log);
} else {
  fwrite($log, "ERROR!\n");
}

fclose($log);
//header('Location: index.php'); //this will only work if nothing is output to the buffer (ie, errors)

?>
