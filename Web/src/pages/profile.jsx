import React, {useState} from "react";
import {ErrorBoundary} from "react-error-boundary";


export default function Profile() {
	let [infoData, set] = useState(undefined);
	let [oldData, setOld] = useState(undefined);

	if (infoData === undefined) {
		oldData = undefined;
		fetch("api/profile")
			.then(async resp => {
				return resp.redirected ? undefined : await resp.json()
			})
			.then((data) => {
				if (!data) {
					set(() => {
					})
					return
				}

				set(JSON.parse(JSON.stringify(data)))

				if (oldData === undefined) {
					if (data.links?.length < 1) {
						data.links.push({original: "N/A", createdAt: undefined, short: "N/A"})
					}
					setOld(JSON.parse(JSON.stringify(data)))
				}
			})
	}

	if (Object.keys(infoData ?? {}).length === 0) {
		return (
			<div className="ProfileApp">
				<ErrorBoundary fallback={<p>There was an error while submitting the form</p>}>
					<form action={async (form) => {
						let res = await fetch("api/profile/login", {method: "POST", body: form})
						if (!res.ok) {
							alert(await res.json())
							return
						}
						set(() => res)
						setOld(() => undefined)
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
					if (!created.ok) {
						alert(await created.json())
						set(undefined);
						return;
					}

					let links = infoData.links.filter(() => true)
					links.push(await created.json())
					infoData.links = links
					set((d) => ({...d}));
					setOld(JSON.parse(JSON.stringify(infoData)))
				}} method="put">
					<label htmlFor="original">Original (6-50)</label><br/>
					<input name="original" id="original" minLength="6" maxLength="50" required/><br/>
					<label htmlFor="shorted">Short (3-15)</label><br/>
					<input name="shorted" id="shorted" minLength="3" maxLength="15"/><br/>
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
						let old = oldData.links.find(x => x.original === l.original);

						const createdAt = l.createdAt !== undefined ? new Date(l.createdAt) : undefined;
						const date = createdAt ? `${createdAt.getDate()}.${createdAt.getMonth()}.${createdAt.getFullYear()}` : "N/A";
						const time = createdAt ? `${createdAt.getHours()}:${createdAt.getMinutes()}` : "N/A";
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
											let res = await fetch('api/links/update', {
												method: 'PATCH',
												body: JSON.stringify({
													old: old.short,
													new: l.short,
												}),
												headers: new Headers({'content-type': 'application/json'})
											})
											if (!res.ok) {
												alert(await res.json())
												return
											}
											setOld(JSON.parse(JSON.stringify(infoData)))
										}}
										disabled={(old.short === "N/A") || old.short === l.short}>update
									</button>
									<br/>
									<button
										onClick={async () => {
											let res = await fetch('api/links/delete', {
												method: 'DELETE',
												body: JSON.stringify({
													original: l.original,
												}),
												headers: new Headers({'content-type': 'application/json'})
											})
											if (!res.ok) {
												alert(await res.json())
												return
											}
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
