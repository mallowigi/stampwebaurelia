export const LocationHelper = {
  getQueryParameter (key, default_ = null) {
    key = key.replace(/[\[]/, "\\\[").replace(/[\]]/, "\\\]");
    key = key.replace("$", "\\$");
    var regex = new RegExp("[\\?&]" + key + "=([^&#]*)");
    var qs = regex.exec(window.location.href);
    if (!qs) {
      return default_;
    } else {
      return decodeURIComponent(qs[1]);
    }
  }
};
