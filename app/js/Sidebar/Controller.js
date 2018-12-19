class Controller
{
	/**
	 * handles topic_list
	 */
	updateTopicList (callbacks)
	{
		var f = () => {
			if (!this_ref.model.hasRun)
				return;

			var topic_tiles = this_ref.topic_list.selectAll(".topic-tile")
				.data(this_ref.model.topics);

			var topic_tiles_enter = topic_tiles.enter().append("a")
				.attr("title", d => {
					var str = "Top words in topic:\n";
					var words = d.getTopWords(10);
					for (var i = 0; i < words.length; i++)
						str += words[i].rank + ": " + words[i].word + "(" + words[i].percentage.toPrecision(2) + "%)\n";
					return str;
				})
				.on('click', d => {
					d.enabled = d.enabled ? false : true;
					for (var i in callbacks)
						if (typeof callbacks[i] == "function")
							callbacks[i]();
				})
				.text((d, i) => i + ": " + d.getTopWord().word)
				.classed("topic-tile", true);
				;

			topic_tiles_enter.merge(topic_tiles)
				.classed("selected", d => d.enabled)
				;

			topic_tiles.exit().remove();

			var story_tiles = this_ref.story_list.selectAll(".story-tile")
				.data(this_ref.corpus.stories);

			var story_tiles_enter = story_tiles.enter().append("a")
				.attr("title", d => {
					return d.title + "\n"
						+ d.subtitle ? (d.subtitle + "\n") : ""
						+ d.author;
				})
				.on('click', d => {
					d.selected = d.selected ? false : true;
					for (var i in callbacks)
						if (typeof callbacks[i] == "function")
							callbacks[i]();
				})
				.text(d => d.title + ", " + d.author)
				.classed("story-tile", true);
				;

			story_tiles_enter.merge(story_tiles)
				.classed("selected", d => d.selected)
				;

			story_tiles.exit().remove();
		};
		callbacks.push(f);
		var this_ref = this;
		return f();
	}

	/**
	 * Update the display of the controls and the topics
	 */
	update ()
	{
		if (!this.model || !this.model.hasRun)
			return;

		var refreshNetwork = this.tn.load_data(this.model);
		var refreshCards = this.scc.load_data(this.model);
		this.updateTopicList([refreshNetwork, refreshCards]);
	}

	/**
	 * Run the initialization for loading a new corpus
	 */
	initCorpus ()
	{
		var corpusSelect = document.getElementById("corpus-select");
		var corpusString = corpusSelect[corpusSelect.selectedIndex].value;

		console.log(corpusString);

		if (corpusString == "empty")
			return;

		this.corpus = new Corpus();
		var corpus_ref = this.corpus;
		var control_ref = this;
		/* parse the data index and fetch the stories */
		d3.tsv("data/"+corpusString+"/data_index.tsv", row => {
			row.rank = parseInt(row.rank);
			return row;
		}).then(function (data) {
			for (var i in data) {
				if (i == "columns") continue;
				/* FIXME: debugging shim */
				// if (i > 1) break;
				var d = data[i];
				corpus_ref.addStory(new Story("data/"+corpusString+"/" + 
							d.file, d.title, d.subtitle, d.author, d.rank));
			}
			return corpus_ref.readyPromise;
		}).then(function (d) {
			var runButton = control_ref.button_cluster.append("button")
					.text("Run " + control_ref.model.toString())
					.on("click", (function (c, d){
						var ctrl_ref = c;
						return function () {
							if (!d3.event.active) {
								runButton.attr("disabled", "disabled");
								ctrl_ref.model.generate_model(d, 10);
								ctrl_ref.update();
							}
						};
					})(control_ref, d))
			control_ref.button_cluster.append("button")
					.text("Show Topic Network")
					.on("click", () => {control_ref.tn.display()})
			control_ref.button_cluster.append("button")
					.text("Show Selected Document Details")
					.on("click", () => {control_ref.scc.display()})
				;
		});
	}

	/**
	 * @param parent_div: single d3 selection containing the div that's to hold
	 *                    the controller's interface.
	 */
	constructor (parent_div, tn, scc)
	{
		/* only option for now */
		this.model = new LDA();
		this.corpus = null;
		this.parent_div = parent_div;
		this.tn = tn;
		this.scc = scc;

		this.working_div = this.parent_div.append("div")
			.attr("id", "topic-container")
			;

		this.topic_list = this.working_div
			.append("div")
			.classed("topic-list", true)
			;
		this.topic_list.append("h3").html("Topics");

		this.story_list = this.working_div
			.append("div")
			.classed("story-list", true)
			;
		this.story_list.append("h3").html("Documents");

		this.button_cluster = this.parent_div.append("div")
			.attr("id", "topic-controls")
			;

		var tn = this;

		var corpusSelectButton = this.button_cluster.append("select")
			.html("<option value=\"empty\">Select a corpus</option>" +
				"<option value=\"state_of_the_union\">State of the Unions</option>" +
				"<option value=\"gutenberg_top20\">Gutenberg Top 20</option>")
			.attr("id", "corpus-select")
			.on("click", () => {
				if (!d3.event.active) {
					corpusSelectButton.attr("disabled", "disabled");
					this.initCorpus();
				}
			})
			;
	}
}
