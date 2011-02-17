$(function() {
  dp.SyntaxHighlighter.HighlightAll('code');
  $('#slides').present();
  $('span.wrongroom').bind('pointEntered', function() {
    $('img.wrongroom').show();
  });
  $('p.wrongroom').bind('pointEntered', function() {
    $('img.wrongroom').removeClass('point').hide();
  });
});
