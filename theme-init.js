(function () {
  try {
    var t = localStorage.getItem('portfolio_theme');
    if (t && ['dark', 'matrix', 'win95'].indexOf(t) !== -1) {
      document.documentElement.classList.add('theme-' + t);
    }
    var l = localStorage.getItem('portfolio_lang');
    if (!l) {
      var userLangs = navigator.languages || [navigator.language || ''];
      var isId = userLangs.some(function (lang) { return lang && lang.toLowerCase().indexOf('id') === 0; });
      l = isId ? 'id' : 'en';
    }
    if (l && ['en', 'id'].indexOf(l) !== -1) {
      document.documentElement.lang = l;
    }
  } catch (e) { }
})();
