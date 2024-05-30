import React, {useState} from "react";
import {ErrorBoundary} from "react-error-boundary";


export default function Profile() {
	let [infoData, set] = useState(undefined);
	let [oldData, setOld] = useState(undefined);

	if (infoData === undefined) {
		oldData = undefined;
		fetch("api/profile")
			.then(async resp => resp?.redirected ?? true ? undefined : await resp.json())
			.then((data) => {
				if (!data) return

				/*if (data.links.length < 1) {
					data.links.push({original: "N/A", createdAt: undefined, short: "N/A"})
				}*/

				set(JSON.parse(JSON.stringify(data)))

				if (oldData === undefined) {
					if (data.links.length < 1) {
						data.links.push({original: "N/A", createdAt: undefined, short: "N/A"})
					}
					setOld(JSON.parse(JSON.stringify(data)))
				}
			})
	}

	if (!infoData) {
		return (
			<div className="ProfileApp">
				<ErrorBoundary fallback={<p>There was an error while submitting the form</p>}>
					<form action={async (form) => {
						await fetch("api/profile/login", {method: "POST", body: form})
						setOld(() => undefined)
						window.location.reload()
					}} method="post">
						<label htmlFor="name">Name</label><br/>
						<input name="name" minLength="3" maxLength="12" required/><br/>
						<label htmlFor="password">Password</label><br/>
						<input type="password" name="password" minLength="4" maxLength="15" required/><br/>
						<button type="submit">Login</button>
					</form>
				</ErrorBoundary>
			</div>
		);
	}
	
	let baseLinks = infoData.links.length > 0 ? infoData.links : [{original: "N/A", createdAt: undefined, short: "N/A"}];

	console.log({l: baseLinks})
	console.log({l: [{original: "N/A", createdAt: undefined, short: "N/A"}]})
	console.log({l: infoData.links})
	return (
		<div className="ProfileApp">
			<button onClick={async () => {
				await fetch("api/profile/logout", {method: "POST"});
				set(undefined)
			}}>Logout
			</button>
			<ErrorBoundary fallback={<p>There was an error while submitting the form</p>}>
				<form action={async (form) => {
					let created = await fetch("api/links/create", {method: "PUT", body: form})
					if (created.ok) {
						let links = infoData.links.filter(() => true)
						links.push(await created.json())
						infoData.links = links
						set((d) => ({...d}));
						setOld(JSON.parse(JSON.stringify(infoData)))
						return;
					}
					set(undefined);
				}} method="put">
					<label htmlFor="original">Original</label><br/>
					<input name="original" id="original" minLength="6" maxLength="50" required/><br/>
					<label htmlFor="shorted">Short</label><br/>
					<input name="shorted" id="shorted" minLength="6" maxLength="15"/><br/>
					<button type="submit">Create</button>
				</form>
			</ErrorBoundary>
			<table width="40%">
				<thead>
				<tr>
					<th>Date</th>
					<th>Original</th>
					<th>Short</th>
					<th>Update</th>
				</tr>
				</thead>
				<tbody>
				{
					baseLinks.map((l) => {
						console.log(l)
						let old = oldData.links.find(x => x.original === l.original);
						
						const createdAt = l.createdAt !== undefined ? new Date(l.createdAt) : undefined;
						const date = `${createdAt?.getDate() ?? "N/A"}.${createdAt?.getMonth() ?? "N/A"}.${createdAt?.getFullYear() ?? "N/A"}`;
						const time = `${createdAt?.getHours() ?? "N/A"}:${createdAt?.getMinutes() ?? "N/A"}`;
						return (
							<tr key={l.original}>
								<td width="20%">{date} {time}</td>
								<td width="40%"><a href={l.original}>{l.original}</a></td>
								<td>
									<input type="text" minLength="3" maxLength="12" value={l.short}
										   onChange={(event) => {
											   l.short = event.target.value
											   set((d) => ({...d}))
										   }}/><br/>
									{
										(old.short !== "N/A" ?
											<a href={`http://${window.location.host}/${old.short}`}>http://{window.location.host}/{old.short}</a> : "")
									}
								</td>
								<td width="1%">
									<button
										onClick={async () => {
											if (l.short === old.short) return;
											await fetch('api/links/update', {
												method: 'PATCH',
												body: JSON.stringify({
													old: old.short,
													new: l.short,
												}),
												headers: new Headers({'content-type': 'application/json'})
											})
											setOld(JSON.parse(JSON.stringify(infoData)))
										}}
										disabled={(old.short === "N/A") || old.short === l.short}>update
									</button>
									<br/>
									<button
										onClick={async () => {
											await fetch('api/links/delete', {
												method: 'DELETE',
												body: JSON.stringify({
													original: l.original,
												}),
												headers: new Headers({'content-type': 'application/json'})
											})
											let links = infoData.links.filter(x => x.original !== l.original)
											infoData.links = links
											set((d) => ({...d}));
											if (links.length < 1) {
												let data = JSON.parse(JSON.stringify(infoData));
												data.links.push({original: "N/A", createdAt: undefined, short: "N/A"})
												setOld(data)
												return
											}
											setOld(JSON.parse(JSON.stringify(infoData)))
										}}
										disabled={(old.short === "N/A")}>delete
									</button>
								</td>
							</tr>
						)
					})
				}
				</tbody>
			</table>
		</div>
	);

}
