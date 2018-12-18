/**
 * Window is the parent class for any view that takes up the whole of the
 * content window.
 */
var g_WindowList = [];
class Window
{
    __hide ()
	{
		this.frame.attr("display", "hidden");
		if (this.stop)
			this.stop()
	}

    __show ()
	{
		this.frame.attr("display", "visible");
		if (this.start)
			this.start()
	}

    /**
     * display: toggle whether or not a particular window is displayed. If the
     *          window is shown, then all other instantiated Window objects are
     *          also hidden.
     *
     * @return: true if the document is made visible, false if it's made hidden.
     */
	display ()
	{
		if (this.frame.attr("display") == "hidden") {
            g_WindowList.forEach(x => x.__hide());
            this.__show();
			return true;
		}
		return true;
		/*
		else {
            this.__hide();
			return false;
		}
		*/
	}

    /**
	 * @param parent_div: d3-selection expected to contain one and only one
	 *                    element, which is interpreted as the parent div for
	 *                    the network visualization
     */
    constructor (parent_div)
    {
		this.parent_div = parent_div;
		this.frame = parent_div.append("div")
			.attr("display", "hidden")
			;

        g_WindowList.push(this);
    }
}
