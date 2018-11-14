/**
 * Class for the data structure and operations that occur for an entire corpus
 */
class Corpus
{
    /**
     * addStory
     *
     * Add a story to the corpus. N.B. that this modifies the state of the
     * corpus.  This function registers the story with the corpus' readyPromise,
     * then exits.
     *
     * @param story
     */
    addStory (story)
    {
		if (this.stories.includes(story))
			throw new Error("Story \'" + story.title
				+ "\' already exists in corpus!");

		this.stories.push(story);

		/* enforce sequential processing of join promises */
		var corpus_ref = this;
		this.readyPromise = this.readyPromise.then(() => story.joinCorpus(corpus_ref));
    }

    /**
     * Initialize a new, empty corpus
     */
    constructor ()
    {
		this.stories = new Array();
		this.vocab = new Array();
		this.frequency = {};

		this.readyPromise = Promise.resolve();
    }
}
