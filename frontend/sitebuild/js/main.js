var Main = (function(w, $){
	var _onSubmit = function(e) {
		var email = $.trim($("input[name=email]").val());
		if(email.length > 5 && email.indexOf('@') > -1) {
			return true;
		}
		return false;
	};
	return {
		init: function() {
			$(".has-tooltip").tooltip();
			$("select").customSelect();
			if( !Modernizr.touch ) {
				$(w).stellar();
			}
			$("form").on('submit', _onSubmit);
			if(w.location.hash === "#success") {
				alert('Thank you for the subscription!')
			}
		}
	}
})(window, jQuery);

$(document).ready(Main.init);
