/*
 * self-executing init function
 */

(function () {
	/* setup content windows */
	var p = d3.select("#content");
	tn = new TopicNetwork(p);
	scc = new StoryCardController(p);
	tn.display();

	var side = d3.select("#sidebar");
	var view_controller = new Controller(side, tn, scc);
})();
