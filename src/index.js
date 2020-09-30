function change() {
  var x = document.getElementById("welcome-section");
  var y = document.getElementById("welcome-text");
  document.getElementById("moji-1").style.display = "none";
  document.getElementById("moji-2").style.display = "none";
  if (y.style.visibility == "hidden") {
    y.style.visibility = "visible";
  } else {
    y.style.visibility = "hidden";
  }

  if (x.style.display == "block") {
    x.style.display = "none";
    if (
      document.documentElement.clientWidth < 768 ||
      document.documentElement.clientHeight > 1000
    ) {
      document.body.style.backgroundImage =
        "url(http://i1.fuimg.com/727097/5e9c8f5358058f9b.jpg)";
    } else {
      document.body.style.backgroundImage =
        "url(https://timgsa.baidu.com/timg?image&quality=80&size=b9999_10000&sec=1601102897901&di=888dc651f47ff5df166d5ad417f7fc97&imgtype=0&src=http%3A%2F%2Fpic1.win4000.com%2Fwallpaper%2Fc%2F5785eaaa59bec.jpg)";
    }
  } else {
    x.style.display = "block";
    document.body.style.backgroundImage = "none";
  }
}
