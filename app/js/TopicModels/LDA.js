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
 * LDA
 *
 * Constructs an LDA topic model for a specific corpus.
 *
 * This class is based on the work in awaisathar/lda.js, which can be found at:
 * https://github.com/awaisathar/lda.js.  The code there is distributed under
 * the Apache liscense.
 */
class LDA
{
	toString ()
	{
		return "LDA Topic Model";
	}

	/**
	 * Adapted from awaisathar's implementation.
	 */
	configure (documents, v, iterations, burnIn, thinInterval, sampleLag)
	{
		this.ITERATIONS = iterations;
		this.BURN_IN = burnIn;
		this.THIN_INTERVAL = thinInterval;
		this.SAMPLE_LAG = sampleLag;
		this.V = v;
		this.dispcol = 0;
		this.numstats = 0;

		this.documents = documents;
	}

	/**
	 * Sets up the initial state of the matrices
	 *
	 * Adapted from awaisathar's implementation.
	 */
	initialState (K)
	{
		var M = this.documents.length;
		this.nw = make2DZeroArray(this.V, K);
		this.nd = make2DZeroArray(M, K);
		this.nwsum = makeZeroArray(K);
		this.ndsum = makeZeroArray(M);
		this.p = makeZeroArray(K);
		this.Z = new Array();
		for (var i = 0; i < M; i++)
			this.Z[i] = new Array();

		for (var m = 0; m < M; m++) {
			var N = this.documents[m].length;
			for (var n = 0; n < N; n++) {
				var topic = Math.floor(Math.random() * K);
				this.Z[m][n] = topic;
				this.nw[this.documents[m][n]][topic]++;
				this.nd[m][topic]++;
				this.nwsum[topic]++;
			}
			this.ndsum[m] = N;
		}
	}

	/**
	 * Adapted from awaisathar's implementation.
	 */
	sampleFullConditional (m, n)
	{
		var topic = this.Z[m][n];

		/* remove from place in matrices */
		this.nw[this.documents[m][n]][topic]--;
		this.nd[m][topic]--;
		this.nwsum[topic]--;
		this.ndsum[m]--;

		/* compute probability vector */
		for (var k = 0; k < this.K; k++)
			this.p[k] = ((this.nw[this.documents[m][n]][k] + this.beta)
						/ (this.nwsum[k] + this.V * this.beta))
					* ((this.nd[m][k] + this.alpha)
						/ (this.ndsum[m] + this.K * this.alpha));

		/* accumulate the probability weights */
		for (var k = 1; k < this.p.length; k++)
			this.p[k] += this.p[k - 1];

		/* select a new topic for the word based on the random scoot that it
		 * gets */
		var u = Math.random() * this.p[this.K - 1];
		for (var topic = 0; topic < this.p.length; topic++) {
			if (u < this.p[topic])
				break;
		}

		/* update matrices */
		this.nw[this.documents[m][n]][topic]++;
		this.nd[m][topic]++;
		this.nwsum[topic]++;
		this.ndsum[m]++;

		return topic;
	}

	/**
	 * Adapted from awaisathar's implementation.
	 */
	updateParams ()
	{
		for (var m = 0; m < this.documents.length; m++) {
			for (var k = 0; k < this.K; k++) {
				this.thetasum[m][k] += (this.nd[m][k] + this.alpha) / 
					(this.ndsum[m] + this.K * this.alpha);
			}
		}
		for (var k = 0; k < this.K; k++) {
			for (var w = 0; w < this.V; w++) {
				this.phisum[k][w] += (this.nw[w][k] + this.beta) / 
					(this.nwsum[k] + this.V * this.beta);
			}
		}
		this.numstats++;
	}

	/**
	 * Adapted from awaisathar's implementation.
	 */
	gibbs (K, alpha, beta)
	{
		this.K = K;
		this.alpha = alpha;
		this.beta = beta;

		if (this.SAMPLE_LAG > 0) {
			this.thetasum = make2DZeroArray(this.documents.length, this.K);
			this.phisum = make2DZeroArray(this.K, this.V);
			this.numstats = 0;
		}

		this.initialState(K);

		for (var i = 0; i < this.ITERATIONS; i++) {
			for (var m = 0; m < this.Z.length; m++) {
				for (var n = 0; n < this.Z[m].length; n++) {
					var topic = this.sampleFullConditional(m, n);
					this.Z[m][n] = topic;
				}
			}

			// XXX: display processing progress
			if (i % this.THIN_INTERVAL == 0) {
				if (i < this.BURN_IN)
					this.dispcol++;
				if (i > this.BURN_IN)
					this.dispcol++;

				console.log("Processing iteration: " + i);
			}

			if ((i > this.BURN_IN) && (this.SAMPLE_LAG > 0) 
					&& (i % this.SAMPLE_LAG == 0)) {
				this.updateParams();
				if (i % this.THIN_INTERVAL != 0)
					this.dispcol ++;
			}
			if (this.dispcol >= 100)
				this.dispcol = 0;
		}
	}

	/**
	 * Generate theta for this model.
	 *
	 * Adapted from awaisathar's implementation.
	 *
	 * @return: an array with documents on the first dimension and the
	 *          document's correspondence with a particular topic on the
	 *          secondary dimension
	 */
	getTheta ()
	{
		var theta = new Array();
		for (var i = 0; i < this.documents.length; i++)
			theta[i] = new Array();

		if (this.SAMPLE_LAG > 0) {
			for (var m = 0; m < this.documents.length; m++) {
				for (var k = 0; k < this.K; k++) 
					theta[m][k] = this.thetasum[m][k] / this.numstats;
			}
		}
		else {
			for (m = 0; m < this.documents.length; m++) {
				for (var k = 0; k < this.K; k++) {
					theta[m][k] = (this.nd[m][k] + this.alpha) / 
						(this.ndsum[m] + this.K + this.alpha);
				}
			}
		}

		return theta;
	}

	/**
	 * Generate phi for this model.
	 *
	 * Adapted from awaisathar's implementation.
	 * 
	 * @return: array of topics, and then each line in the topic is the
	 *          corresponding word's importance to the topic.
	 */
	getPhi ()
	{
		var phi = new Array();
		for (var i = 0; i < this.K; i++)
			phi[i] = new Array();

		if (this.SAMPLE_LAG > 0) {
			for (var k = 0; k < this.K; k++) {
				for (var w = 0; w < this.V; w++) {
					phi[k][w] = this.phisum[k][w] / this.numstats;
				}
			}
		}
		else {
			for (var k = 0; k < this.K; k++) {
				for (var w = 0; w < this.V; w++) {
					phi[k][w] = (this.nw[k][w] + this.beta) /
						(this.nwsum[k] + this.V * this.beta);
				}
			}
		}

		return phi;
	}

	/**
	 * Implement functions from TopicModel
	 *
	 * based on awaisathar's index.html
	 *
	 * @param corpus: corpus opject to link into the model
	 * @param K: number of topics to generate
	 */
	generate_model (corpus, K)
	{
		if (this.lock) {
			// alert("Please wait for the current topic modelling task to finish "+
			alert("Please refresh the page " + 
					"before running a new model. There's a weird " + 
					"copy-dependency somewhere that breaks new networks.");
			return;
		}
		this.lock = true;
		this.hasRun = false;

		this.corpus = corpus;

		var V = corpus.vocab.length;
		var M = corpus.stories.length;
		var documents = corpus.stories.map(s => s.wordIndices);
		var alpha = 0.1; // per-document distributions over topics
		var beta = 0.01; // per-topic distributions over words

		/* awaisathar's magic numbers */
		// this.configure(documents, V, 1000, 2000, 100, 10);
		this.configure(documents, V, 1000, 10, 50, 5);
		this.gibbs(K, alpha, beta);

		/* importance of a document to a topic */
		this.theta = this.getTheta();
		/* importance of terms in a topic */
		this.phi = this.getPhi();

		this.topics = new Array();
		/* create topic array */
		for (var i = 0; i < K; i++) {
			var temp_theta = new Array();
			for (var j = 0; j < M; j++)
				temp_theta.push(this.theta[j][i]);

			this.topics.push(new Topic(temp_theta, this.phi[i],
						corpus.stories, corpus.vocab));
		}

		this.lock = false;
		this.hasRun = true;
		return;
	}

	isSafe () { return (this.lock && this.hasRun); }

    /**
     * Initialize new LDA model with default values from awaisathar's
	 * implementation.
     */
    constructor ()
    {
		this.hasRun = false;
		this.lock = false;
		this.theta = null;
		this.phi = null;
		this.corpus = null;

		/* model specific defaults */
		/* display update interval */
		this.THIN_INTERVAL = 20;
		/* tunable */
		this.BURN_IN = 100;
		/* tunable */
		this.ITERATIONS = 1000;
		/* tunable */
		this.SAMPLE_LAG = 10;
		/* ??? */
		this.dispcol = 0;
		this.numstats = 0;

		this.documents = null;
    }
}
