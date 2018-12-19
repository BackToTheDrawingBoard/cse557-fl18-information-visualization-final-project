class NaiveTopicModel extends TopicModel
{
	get_top_words (i, n_words)
	{
		if (!this.corpus)
			return null;

		var ret = "";
		ret += "topic " + i + ":\n";
		for (var j in this.topics[i]) {
			var idx = this.topics[i][j];
			ret += j + ":\t" + this.corpus.vocab[idx] + " (" + (this.corpus.frequency[idx] / this.popularity[i]).toPrecision(2) + "%)\n";
			if (j == n_words)
				break;
		}
		ret += "\n";

		return ret;
	}

	generate_model (corpus, n_topics)
	{
		this.corpus = corpus;
		this.topics = new Array();
		for (var i = 0; i < n_topics; i++)
			this.topics[i] = new Array();

		this.popularity = makeZeroArray(n_topics);
		this.total_pop_count = 0;

		for (var i in this.corpus.vocab) {
			var new_index = Math.floor(Math.random() * this.topics.length);
			if (this.topics[new_index].includes(i))
				throw new Error(i + " already exists!");
			this.topics[new_index].push(i);
			this.popularity[new_index] += this.corpus.frequency[i];
			this.total_pop_count += this.corpus.frequency[i];
		}

		/* model output */
		for (var i in this.topics) {
			this.topics[i].sort(function (a, b) {
				return corpus.frequency[a] - corpus.frequency[b];
			}).reverse();

			console.log(this.get_top_words(i, 10));
		}
	}

	constructor ()
	{
		super();
	}
}
