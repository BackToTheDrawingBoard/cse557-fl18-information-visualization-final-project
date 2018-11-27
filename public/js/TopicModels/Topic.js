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

	/** story_affinity:
	 * @return the relative affinity of a particular story to a topic
	 */
	story_affinity (story)
	{
		var affinity = 0;
		/* Iterate over words in the story's frequency table. 'i' is the index
		 * of the word in the corpus' vocab table, so theta and frequency should
		 * share the same indexing for each word. */
		for (var i in story.frequency) {
			affinity += this.theta[i] * story.frequency[i];
		}

		return affinity / story.n_words;
	}

	/**
	 * @param theta:
	 * @param phi:
	 * @param stories:
	 * @param vocab:
	 */
	constructor (theta, phi, stories, vocab)
	{
		if (!theta || !phi || !stories || !vocab)
			throw new Error("Constructor called with too few arguments");

		/* the weight of a word to a story */
		this.theta = theta;
		/* the weight of a word to a topic */
		this.phi = phi;
		this.stories = stories;
		this.vocab = vocab;
		this.sorted_words = null;
		this.affinities = new Array();
	}
}
