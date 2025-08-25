Array.from(document.getElementsByTagName("img")).forEach((img) => {
  img.src = "../" + img.src.substring(img.src.indexOf("img"));
});
