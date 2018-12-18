class Controller
{
	/**
	 * handles topic_list
	 */
	updateTopicList (refreshSimulation)
	{
		console.log(refreshSimulation);
		if (!this.model.hasRun)
			return;

		console.log("Updating model list", this.model.topics);

		var a = this.topic_list.selectAll("a")
			.data(this.model.topics);

		a.enter().append("a")
			.attr("title", d => {
				var str = "Top words in topic:\n";
				var words = d.getTopWords(10);
				for (var i = 0; i < words.length; i++)
					str += words[i].rank + ": " + words[i].word + "(" + words[i].percentage.toPrecision(2) + "%)\n";
				return str;
			})
			.on('click', d => {
				d.selected = d.selected ? false : true; 
				refreshSimulation();
			})
			.text((d, i) => i + ": " + d.getTopWord().word)
			.classed("selected", d => d.selected)
			;

		a.exit().remove();
	}

	/**
	 * Update the display of the controls and the topics
	 */
	update ()
	{
		if (!this.model || !this.model.hasRun)
			return;
		else
			console.log("Updating model segment");

		this.updateTopicList(this.tn.load_data(this.model));
	}

	/**
	 * Run the initialization for loading a new corpus
	 */
	initCorpus ()
	{
		this.corpus = new Corpus();
		var corpus_ref = this.corpus;
		var control_ref = this;
		/* parse the data index and fetch the stories */
		// XXX:
		d3.tsv("data/state_of_the_union/data_index.tsv", row => {
			row.rank = parseInt(row.rank);
			return row;
		}).then(function (data) {
			for (var i in data) {
				if (i == "columns") continue;
				/* FIXME: debugging shim */
				// if (i > 1) break;
				var d = data[i];
				corpus_ref.addStory(new Story("data/state_of_the_union/" + d.file, d.title,
										d.subtitle, d.author, d.rank));
			}
			return corpus_ref.readyPromise;
		}).then(function (d) {
			control_ref.button_cluster.append("button")
				.text("Run " + control_ref.model.toString())
				.on("click", (function (c, d){
					var ctrl_ref = c;
					return function () {
						ctrl_ref.model.generate_model(d, 10);
						ctrl_ref.update();
					};
				})(control_ref, d))
				;
			// control_ref.button_cluster.append(
		});
	}

	/**
	 * @param parent_div: single d3 selection containing the div that's to hold
	 *                    the controller's interface.
	 */
	constructor (parent_div, tn)
	{
		/* only option for now */
		this.model = new LDA();
		this.corpus = null;
		this.parent_div = parent_div;
		this.tn = tn;

		this.working_div = this.parent_div.append("div")
			.attr("id", "topic-container")
			;

		this.topic_list = this.working_div
			.append("div")
			.classed("topic-list", true)
			;

		this.button_cluster = this.parent_div.append("div")
			.attr("id", "topic-controls")
			;

		this.initCorpus();
	}
}
