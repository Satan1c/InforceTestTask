import React from 'react';

function NoPage() {
	fetch(`api/links/${window.location.pathname.slice(1)}`)
		.then((res) => {
			if (res.ok) {
				res.json().then((t) => {
					window.location.replace(t);
				})
			}
		});

	return (<h1>404</h1>)
}

export default NoPage;
