/**
 * StoryCardController is the parent for each of the story cards, which are
 * displayed in the content window.
 */
class StoryCardController extends Window
{
	/**
	 * StoryCardController extends Window
	 */
	constructor (parent_div)
	{
		super(parent_div);
		this.frame.classed("story-cards-window", true);
	}
}
