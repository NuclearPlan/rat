namespace Web.UI.Views {

    import WindowsOutgoingMessage = Network.Messages.WindowsOutgoingMessage;
    import WindowIncomingEvent = Network.Events.WindowsIncomingMessage;
    import setSubView = Containers.setSubView;
    import DesktopComponent = Components.DesktopComponent;
    import Frame = Desktop.Frame;
    import Monitor = Desktop.Monitor;
    import WindowAction = Network.Messages.WindowAction;

    class WindowContextMenu extends ContextMenu {

        private view: WindowView;

        private downloadItem;
        private deleteItem;

        constructor(parent: WindowView) {
            super(parent.table, parent.getElementById("menu"));

            this.view = parent;

            this.downloadItem = parent.getElementById("item-open");
            this.downloadItem.onclick = () => parent.show();

            this.deleteItem = document.getElementById("item-minimize");
            this.deleteItem.onclick = () => parent.minimize();

            document.getElementById("item-stream").addEventListener("click", () => parent.stream());
        }
    }

    export class WindowView extends SubView {

        private desktop: DesktopComponent;
        private frames: Frame[];

        constructor(client: Client) {
            super("window.html", "Window List", client);

            this.desktop = new DesktopComponent(client);
        }

        private clear() {
            this.table.innerHTML = "";
        }

        private reload() {
            this.clear();
            Web.Network.Socket.send(new WindowsOutgoingMessage({
                action: WindowAction.RELOAD
            }), this.client);
        }

        public onEnter() {
            Web.Network.Events.addEvent(Web.Network.Header.Windows, new WindowIncomingEvent(this));

            let searchElement = this.getElementById("search") as HTMLInputElement;
            new TableSearch(searchElement, this.table);

            let desktopDiv = this.getElementById("desktop");
            desktopDiv.appendChild(this.desktop.element);
            this.desktop.frameClick = (frame: Frame) => this.onclick(frame);

            let reloadElement = this.getElementById("reload");
            reloadElement.onclick = () => this.reload();

            let menu = new WindowContextMenu(this);
            menu.hook();

            this.reload();
        }

        public onLeave() {

        }

        public addMonitors(monitors: Monitor[]) {
            this.desktop.setMonitors(monitors);
        }

        public addFrame(allFrames: Frame[]) {
            let frames: Frame[] = [];

            for (let window of allFrames) {
                if (Desktop.displayFrame(this.client.operatingSystem.type, window)) {
                    frames.push(window);

                    let row = this.table.insertRow(0);

                    let titleCell = row.insertCell();

                    if (window.icon !== "") {
                        titleCell.appendChild(Desktop.getIcon(window));
                    }

                    let titleElement = document.createElement("span");
                    titleElement.innerText = window.title;
                    titleCell.appendChild(titleElement);

                    row.insertCell().innerText = window.handle + "";

                    row.onclick = () => {
                        if (row.className.indexOf("selected") === -1) {
                            row.className += " selected";
                        } else {
                            row.className = row.className.replace(" selected", "");
                        }
                    }
                }
            }

            this.desktop.setFrames(frames);
            this.frames = frames;
        }

        // A frame is clicked in the desktop element
        private onclick(frame: Frame) {
            let rows = this.table.rows;

            for (let i = 0; i < rows.length; i++) {
                let row = rows[i];

                if (row.cells[0].innerText === frame.title) {
                    row.className += "selected";
                    row.scrollIntoView(true);
                } else {
                    row.className = row.className.replace(" selected", "");
                }
            }
        }

        public getSelectedFrames(): Frame[] {
            let rows = this.table.rows;

            let frames: Frame[] = [];

            for (let i = 0; i < rows.length; i++) {
                let row = rows[i];

                if (row.className.indexOf("selected") !== -1) {
                    let title = row.cells[0].innerText;
                    let handle = row.cells[1].innerText;

                    for (let frame of this.frames) {
                        if (frame.title === title && String(frame.handle) === handle) {
                            frames.push(frame);
                        }
                    }
                }
            }

            return frames;
        }

        public show() {
            this.doAction(WindowAction.SHOW, this.getSelectedFrames());
        }

        public minimize() {
            this.doAction(WindowAction.MINIMIZE, this.getSelectedFrames());
        }

        public stream() {
            let frames = this.getSelectedFrames();

            if (frames.length > 0) {
                let frame = frames[0];

                setSubView(new SingleWindowView(this.client, frames, frame));
            }
        }

        private doAction(action: WindowAction, frames: Frame[]) {
            Web.Network.Socket.send(new WindowsOutgoingMessage({
                action: action,
                frames: frames
            }), this.client);
        }

        public get table(): HTMLTableElement {
            return this.getElementById("windows") as HTMLTableElement;
        }
    }
}