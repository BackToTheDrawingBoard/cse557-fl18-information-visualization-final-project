/* array helpers */
function makeZeroArray (x) {
	var a = new Array();
	for (var i = 0; i < x; i++)
		a[i] = 0;

	return a;
}
function make2DZeroArray (x, y) {
	var a = new Array();
	for (var i = 0; i < x; i++) {
		a[i] = new Array();
		for (var j = 0; j < y; j++)
			a[i][j] = 0;
	}

	return a;
}

/**
 * Abstract class to implement multiple topic models
 */
class TopicModel
{
	toString ()
	{
		return this.name ? this.name : "";
	}

	/**
	 * generate_model
	 *    Read in a series of stories and prepare them in the topic model. N.B.
	 *    that this function shall not generate a topic model for the stories,
	 *    just prepare them.
	 *
	 * @param stories: an array of stories (as strings) to parse and add to the
	 *                 topic model
	 *
	 * Sets up the following data structures:
	 *        theta: array[story_idx][topic] = relevance,
	 *          phi: array[topic][word_idx]  = relevance,
	 * And links up with these in the corpus:
	 *        vocab: array[word_idx]         = corresponding_string,
	 *    documents: array[story_idx]        = corresponding_story,
	 *
	 */
	generate_model ()
	{
		this.hasRun = true;
	}

	/**
	 * Initialize topic model with defaults
	 */
	constructor ()
	{
		this.name = null;
		this.hasRun = false;
		this.theta = null;
		this.phi = null;
		this.corpus = null;
	}
}
