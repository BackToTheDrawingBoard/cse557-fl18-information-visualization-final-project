/**
 * Supporting data structure for particular stories.
 *
 * Stories are recorded as a vector of words. Document structure is discarded.
 */
class Story
{
    /**
     * joinCorpus
     *
     * @param corpus: parent corpus to join
     * @return: Promise that completes when the story's been added to the
     *          corpus's data structures
     */
    joinCorpus (corpus)
    {
	var story_ref = this;
	return this.loadPromise.then(function (text) {
			/* Split on whitespace first, the replace individual
			 * characters in the words to save on memory usage versus
			 * having to do a full-document regex. */
			var chunks = text.split(/\s/g);

			for (var i in chunks) {
				/* normalize and remove all non-word or apostraphe
				 * characters */
				var w = chunks[i].toLowerCase().replace(/[^\'\w]+/g, '');
				/* skip lame words */
				if (w.length <= 1 || stopwords[w] || !isNaN(+w))
					continue;

				var idx = corpus.vocab.indexOf(w);
				if (idx != -1) {
					corpus.frequency[idx] += 1;
				}
				else if (w) {
					corpus.frequency[corpus.vocab.length] = 1;
					corpus.vocab.push(w);
				}
				story_ref.wordIndices.push(corpus.vocab.indexOf(w));
			}
			/* return story_ref; */
			return corpus;
		});
    }

    /**
     * Fetch the contents of the story
     *
     * XXX: only args should be corpus filename, the other args are just
     * decorative metadata that don't directly pretain to the data
     * representation of the story. There's too much happening in this function.
     */
    constructor (filename, title, subtitle, author, rank)
    {
		/* generic variables */
		this.author = author;
		this.title = title;
		this.subtitle = subtitle;
		this.rank = rank;

		this.wordIndices = new Array();
		
		/* fly away into the land of asynchronous callbacks to load the story */
		var story_ref = this;
		this.loadPromise = d3.text(filename)
			.then(function (text) {
				return text;
			});
    }
}
