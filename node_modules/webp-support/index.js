var webp_name = 'can_use_webp';
function detectWebp() {
  if (!window.localStorage || typeof localStorage !== 'object') return;
  if (!localStorage.getItem(webp_name) || (localStorage.getItem(webp_name) !==
      'available' && localStorage.getItem(webp_name) !== 'disable')) {
    var img = document.createElement('img');
    img.onload = function() {
      try {
        localStorage.setItem(webp_name, 'available');
      } catch (ex) {}
    };

    img.onerror = function() {
      try {
        localStorage.setItem(webp_name, 'disable');
      } catch (ex) {}
    };
    img.src =
      'data:image/webp;base64,UklGRkoAAABXRUJQVlA4WAoAAAAQAAAAAAAAAAAAQUxQSAsAAAABBxAREYiI/gcAAABWUDggGAAAADABAJ0BKgEAAQABABwlpAADcAD+/gbQAA==';
  }
}

detectWebp();

module.exports = function() {
  return !!window.localStorage && window.localStorage.getItem(webp_name) === 'available';
};
