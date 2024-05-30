import React from 'react';

function About() {
	return (
		<div>
			<h1>About Us</h1>
			<p>Welcome to <b>Shortener</b> – your go-to solution for effortless URL shortening!</p>
			<p>At Shortener, we understand the importance of simplicity and security in sharing web addresses.</p>
			<p>That’s why we’ve designed a unique URL shortener that leverages the power of GUIDs (Globally Unique Identifiers) to create short, reliable, and secure links.</p>

			<h1>Why Choose Shortener?</h1>
			<ul>
				<li>
					<p>
						<b>Enhanced Security</b>: By using GUIDs, we provide an extra layer of security, minimizing the risk of unauthorized
						access and reducing the chances of malicious guessing of URLs.
					</p>
				</li>
				<li>
					<p>
						<b>Ease of Use</b>: Shortening a URL with Shortener is as simple as clicking a button. Just paste your long URL, and
						we’ll instantly provide you with a shortened version that’s easy to share and manage.
					</p>
				</li>
				<li>
					<p>
						<b>Reliability</b>: GUIDs are designed to be unique across time and space, ensuring that your shortened URLs remain
						functional and conflict-free, no matter how many links you create.
					</p>
				</li>
			</ul>
		</div>
	)
}

export default About;
