<?php
// Public domain. NO WARRANTY EXPRESSED OR IMPLIED. USE AT YOUR OWN RISK.

$im = imagecreatetruecolor(512, 32);
$bg = imagecolorallocate($im, 0, 0, 0);

if (isset($_SERVER['HTTP_REFERER'])) {
    $string = "Referrer: " . $_SERVER['HTTP_REFERER'];
    $textcolor = imagecolorallocate($im, 0xff, 0, 0);
} else {
    $string = "No referrer information.";
    $textcolor = imagecolorallocate($im, 0, 0xff, 0xff);
}

imagettftext($im, 13, 0, 5, 22, $textcolor, "/usr/share/fonts/truetype/ttf-dejavu/DejaVuSans-Bold.ttf", $string);

header("Expires: Mon, 26 Jul 1997 05:00:00 GMT");
header("Last-Modified: " . gmdate("D, d M Y H:i:s") . " GMT");
header("Cache-Control: no-store, no-cache, must-revalidate");
header("Cache-Control: post-check=0, pre-check=0", false);
header("Pragma: no-cache");
header("Content-type: image/png");

imagepng($im);
imagedestroy($im);
?>