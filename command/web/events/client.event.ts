const enum ClientUpdateType {
	// Add client, on server connect or web panel open
	ADD = 0,

	// Update client data
	UPDATE = 1,

	// Remove client
	REMOVE = 2
}

interface ClientUpdateParameters {
	type: ClientUpdateType;
	// client id
	id: number;

	data: ClientFields;
}

class ClientUpdateEvent implements IncomingEvent<ClientUpdateParameters> {

	public emit(data: ClientUpdateParameters) {
		let params = data.data;
		console.log(params);

		let client: Client;

		switch (data.type) {
			case ClientUpdateType.ADD:
				client = new Client(data.id, data.data);
				Client.clients.push(client);
				MainViewContainer.clientsView.add(client);
				break;
			case ClientUpdateType.UPDATE:
				client = Client.getById(data.id);

				if (params.ping) {
					MainViewContainer.clientsView.setCell(client, TableCell.PING, client.ping = params.ping);
				}

				break;
			case ClientUpdateType.REMOVE:
				client = Client.getById(data.id);
				MainViewContainer.clientsView.remove(client);
							
				delete Client.clients[Client.clients.indexOf(client)];
		}
	}
}