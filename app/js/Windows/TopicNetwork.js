/**
 * TopicNetwork contains the force-graph of the stories and topics.
 */
class TopicNetwork extends Window
{
	/** start:
	 * Start processing for the visualization
	 */
	start ()
	{
		this.enabled = true;
		if (this.refreshDisplay)
			this.refreshDisplay();
	}

	/** stop:
	 * stop processing for the visualization
	 */
	stop ()
	{
		this.enabled = false;
		if (this.suspendDisplay)
			this.suspendDisplay();
	}

	/** load_data:
	 * called to update the data that the window's currently displaying
	 */
	load_data (model)
	{
		/* lock released at the end of redraw() */
		if (this.lock)
			return;
		this.lock = true;

		/* story -> topic -> weight */
		this.weights = model.theta;
		this.stories = model.corpus.stories;
		this.topics = model.topics;
		this.lock = model.lock;

		return this.redraw();
	}

	update_selection_list ()
	{
		var li = this.corner_list.selectAll('li')
			.data(this.stories.filter(s => s.selected), s => s.filename);

		var li_enter = li.enter().append('li');
		li_enter.append('b').text(s => s.title);
		li_enter.append('span').text(s => s.author);

		li.exit().remove();
	}

	redraw ()
	{
		var rect = this.svg.node().getBoundingClientRect();
		var N = this.stories.length;
		var M = this.topics.length;
		// var M = 4;

		this.svg.attr("viewBox", 
					  (-rect.width / 2) + " "
					+ (-rect.height / 2) + " "
					+ (rect.width) + " "
					+ (rect.height)
				)

		/* Setup nodes for the simulation */
		var nodes = new Array();
		/* story nodes */
		for (var i = 0; i < N; i++) {
			nodes.push({
				id : i,
				isTopic : false,
				color : "blue",
				data : this.stories[i],
				radius : 10,
				title : this.stories[i].title + "\n" + this.stories[i].author,
				/*
				x : 0,
				y : 0
				*/
			});
		}
		/* topic nodes */
		for (var i = 0; i < M; i++) {
			var rad = -Math.PI * 2 * (i / M) + Math.PI;
			nodes.push({
				id : N + i,
				isTopic : true,
				color : "green",
				data : this.topics[i],
				title : this.topics[i].getTopWord().word,
				radius : 20,
				x : Math.sin(rad) * (rect.width * 0.4),
				y : Math.cos(rad) * (rect.height * 0.4)
			});
		}
		/* Setup edges for the simulation */
		var edges = new Array();
		var flat_edges = new Array();
		for (var i = 0; i < M; i++) {
			edges.push(new Array());
			for (var j = 0; j < N; j++) {
				edges[i].push({
					source: j,
					target: N + i,
					weight: this.weights[j][i],
					topic: this.topics[i]
				});
				flat_edges[(i * N) + j] = edges[i][j];
			}
		}

		/* Setup simulation */
		var link_strength_scale = d3
			.scalePow().exponent(3)
			.domain([d3.min(flat_edges.map(e => e.weight)),
						d3.max(flat_edges.map(e => e.weight))])
			.range([0.1, 6]);
		var simulation = d3.forceSimulation(nodes)
			.force("charge", d3.forceManyBody().strength(-600))
			.force("center", d3.forceCenter(0, 0))
			.force("bump", d3.forceCollide().radius(d => d.radius))
			.stop();

		/* setup vis */
		var tn = this;

		var node_drag_callback = sim => {
			return d3.drag()
				.on('start', (n) => {
					if (!d3.event.active) {
						sim.alphaTarget(0.3).restart();
					}
					n.fx = d3.event.x;
					n.fy = d3.event.y;
					n.data.selected = !n.data.selected;
					tn.update_selection_list();
				})
				.on('drag', (n) => {
					n.fx = d3.event.x;
					n.fy = d3.event.y;
				})
				.on('end', (n) => {
					if (!d3.event.active)
						sim.alphaTarget(0.001);
					n.fx = null;
					n.fy = null;
				})
		};

		var ticked = function () {
			var lines = tn.svg.selectAll('line').data(flat_edges);
			lines.enter().append('line')
				.attr('stroke', 'grey')
				.attr('width', '2px')
				.merge(lines)
				.attr('x1', d => d.source.x)
				.attr('y1', d => d.source.y)
				.attr('x2', d => d.target.x)
				.attr('y2', d => d.target.y)
				.style('visibility', d => !d.topic.enabled ?
											'hidden' : 'visible')
				;
			lines.exit().remove();

			var circles = tn.svg.selectAll('.tn-circle').data(nodes);
			var circlesEnter = circles.enter().append('g')
				.classed("tn-circle", true)
				.call(node_drag_callback(simulation))
				;

			circlesEnter.append('circle')
				.attr('r', d => d.radius)
				.attr('fill', d => d.color)
				;
			circlesEnter.append('text')
				.text(d => d.isTopic ? d.id - N : '')
				.attr('text-anchor', 'middle')
				.attr('dominant-baseline', 'middle')
				.attr('stroke', 'white')
				.attr('fill', 'white')
				;
			circlesEnter.append('title')
				.text(d => d.title)
				;
			circlesEnter.merge(circles)
				.attr('transform', d => 'translate(' + d.x + ',' + d.y + ')')
				.style('visibility', d => d.isTopic && !d.data.enabled ?
											'hidden' : 'visible')
				.attr('stroke-width', d => {
					if (!d.isTopic && d.data.selected)
						return 4;
					else
						return 0;
				})
				.attr('stroke', d => {
					if (!d.isTopic && d.data.selected)
						return "white";
					else
						return null;
				})
				;
			circles.exit().remove();
		};

		simulation.on("tick", ticked);
			simulation.restart();

		/* return a callback to refresh the simulation's forces */
		var refresh_forces = function () {
			simulation.alpha(0.3).restart();
			for (var i = 0; i < M; i++) {
				simulation.force("topic_" + i, tn.topics[i].enabled
					? d3.forceLink(edges[i])
						.id(n => n.id)
						.strength(d => link_strength_scale(d.weight))
					: null
				)
			}
			tn.update_selection_list();
		};
		if (this.enabled)
			refresh_forces();
		this.refreshDisplay = refresh_forces;
		this.suspendDisplay = simulation.stop;
		// this.lock = false;
		return refresh_forces;
	}

	/**
	 * TopicNetwork extends Window
	 */
	constructor (parent_div)
	{
		super(parent_div);
		this.frame.classed("topic-network-window", true);
		this.enabled = false;

		var rect = this.frame.node().getBoundingClientRect();
		this.svg = this.frame.append("svg")
			.attr("height", "100%")
			.attr("width", "100%")
			.style("background-color", "pink")
			;

		this.corner_list = this.frame
			.append("div").attr("id", "corner-list")
			.append("h3").text("Selection")
			.append("ul")
			;
	}
}
