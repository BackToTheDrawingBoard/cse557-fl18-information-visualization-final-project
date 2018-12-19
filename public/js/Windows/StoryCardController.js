/**
 * StoryCardController is the parent for each of the story cards, which are
 * displayed in the content window.
 */
class StoryCardController extends Window
{
	start ()
	{
		if (!this.model)
			return;

		var data = this.model.corpus.stories.filter(s => s.selected);
		if (data === [])
			return;
		var cards = this.frame.selectAll('.scc-card')
				.data(data, s => s.filename);

		var cardsEnter = cards.enter().append('div').classed('scc-card', true);

		cardsEnter.append("h2").text(s => s.title);
		cardsEnter.append("p").text(s => {
			s.author + " Words: " + s.wordIndices.length
		});

		return;
	}

	stop ()
	{
		return;
	}

	/** load_data:
	 * load a new model into the story card controller
	 */
	load_data (model)
	{
		this.model = model;

		return () => {console.log("callback!")};
	}

	/**
	 * StoryCardController extends Window
	 */
	constructor (parent_div)
	{
		super(parent_div);
		this.frame.classed("story-cards-window", true)
			.style('background-color', 'lightgreen')
			.append("h1").text("Selected Documents:")
			;
	}
}
