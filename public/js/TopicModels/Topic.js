class TopicWord
{
	static compareByWeight (a, b)
	{
		return a.weight - b.weight;
	}

	constructor (word, weight)
	{
		this.word = word;
		this.weight = weight;
	}
}

class Topic
{
	getTopWord ()
	{ return this.getTopWords(1)[0]; }

	/**
	 * @param n_words: number of words to return
	 * @return: an array of {rank, word, percentage}
	 */
	getTopWords (n_words)
	{
		this.sorted_words = new Array();
		for (var w = 0; w < this.phi.length; w++)
			this.sorted_words.push(new TopicWord(this.vocab[w], this.phi[w]));

		this.sorted_words.sort(TopicWord.compareByWeight).reverse();

		var ret = new Array();
		for (var i = 1; i < this.sorted_words.length; i++) {
			if (i > n_words)
				break;
			ret.push({rank: i, word: this.sorted_words[i].word, 
				percentage: (this.sorted_words[i].weight * 100)});
		}
		return ret;
	}

	constructor (theta, phi, stories, vocab)
	{
		if (!theta || !phi || !stories || !vocab)
			throw new Error("Constructor called with too few arguments");

		this.theta = theta;
		this.phi = phi;
		this.stories = stories;
		this.vocab = vocab;
		this.sorted_words = null;
	}
}
