$('.section').each(function() {
    new Waypoint.Inview({
        element: this,
        entered: function(direction) {
            $(this.element).addClass('in-viewport');
        }
    });
});

