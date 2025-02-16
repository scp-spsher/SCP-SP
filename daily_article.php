<?php

$articles = array(
  "/scp-003-sp",
  "/scp-004-sp",
  "/scp-016-sp",
  "/scp-101-sp",
  "/scp-218-sp",
  "/scp-228-sp",
  "/scp-295-sp",
  "/scp-318-sp",
  "/scp-410-sp",
  "/scp-476-sp",
  "/scp-718-sp",
  "/scp-621-sp-ex",
  "/scp-1000-sp-j",
  "/scp-002",
  "/scp-029",
  "/scp-117",
  "/scp-811",
  "/scp-914",
);
function getRandomArticleIndex($articles) {
  $seed = date("Ymd");
  srand($seed);
  return rand(0, count($articles) - 1);
}
$randomIndex = getRandomArticleIndex($articles);
$articleUrl = $articles[$randomIndex];
$fullArticleUrl = "scp-sp.ru" . $articleUrl;

?>

<div id="daily-article">
  <h2>Статья дня:</h2>
  <a href="<?php echo $fullArticleUrl; ?>"><?php echo $fullArticleUrl; ?></a>
</div>
