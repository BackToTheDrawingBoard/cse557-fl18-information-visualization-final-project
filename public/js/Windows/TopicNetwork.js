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
	}

	/** stop:
	 * stop processing for the visualization
	 */
	stop ()
	{
		this.enabled = false;
	}

	/** load_data:
	 * called to update the data that the window's currently displaying
	 */
	load_data (model)
	{
		console.log(model);
		/* story -> topic -> weight */
		this.weights = model.theta;
		this.stories = model.corpus.stories;
		this.topics = model.topics;

		var rect = this.svg.node().getBoundingClientRect();
		var N = this.stories.length;
		// var M = this.topics.length;
		var M = 3;

		/* Setup nodes for the simulation */
		var nodes = new Array();
		/* story nodes */
		for (var i = 0; i < N; i++) {
			nodes.push({
				id : i,
				isTopic : false,
				color : "green",
				data : this.stories[i],
				x : 0,
				y : 0
			});
		}
		/* topic nodes */
		for (var i = 0; i < M; i++) {
			var rad = Math.PI * 2 * ((i + 1) / M);
			console.log("rad", rad);
			nodes.push({
				id : N + i,
				isTopic : true,
				color : "blue",
				data : this.topics[i],
				fx : Math.sin(rad) * (rect.width * 0.4),
				fy : Math.cos(rad) * (rect.height * 0.4)
			});
		}
		/* Setup edges for the simulation */
		var edges = new Array();
		for (var i = 0; i < N; i++) {
			for (var j = 0; j < M; j++) {
				edges.push({
					source: i,
					target: N + j,
					weight: model.theta[i][j]
				});
			}
		}

		/* setup vis */
		var tn = this;
		var circles = tn.svg.selectAll('circle').data(nodes);
		var lines = tn.svg.selectAll('line').data(edges);

		var circlesEnter = circles.enter().append('g');

		var ticked = function () {
			var rect = tn.svg.node().getBoundingClientRect();
			var x_scale = d3.scaleLinear()
				.domain([-rect.width / 2, rect.width / 2])
				.range([0, 100]);
			var y_scale = d3.scaleLinear()
				.domain([-rect.height / 2, rect.height / 2])
				.range([0, 100]);

			circles.enter().append('circle')
				.attr('r', function (d) {
					if (d.isTopic)
						return 20;
					return 10;
				})
				.attr('fill', d => d.color)
				.append('g')
					.append('t')
				.merge(circles)
				.attr('cx', function (d) {
					return x_scale(d.x) + "%";
				})
				.attr('cy', function (d) {
					return y_scale(d.y) + "%";
				})
				;

			circles.exit().remove();
		};

		console.log(tn.svg.attr("width"));

		/* Setup simulation */
		var simulation = d3.forceSimulation(nodes)
			.force("charge", d3.forceManyBody().strength(-10))
			.force("center", d3.forceCenter())
			.force("link", d3.forceLink(edges)
					.strength(d => 20 * d.weight)
			)
			.on("tick", ticked)
			;
	}

	/**
	 * TopicNetwork extends Window
	 */
	constructor (parent_div)
	{
		super(parent_div);
		this.frame.classed("topic-network-window", true);
		this.enabled = false;
		this.svg = parent_div.append("svg")
			.attr("height", "100%")
			.attr("width", "100%")
			.style("background-color", "pink");
		console.log(this.svg);
	}
}
