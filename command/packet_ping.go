package main

import (
	"rat/command/utils"
	"rat/common"
	"time"
)

type Ping struct {
	IncomingPacket
	OutgoingPacket
}

func (packet Ping) GetHeader() common.PacketHeader {
	return common.PingHeader
}

func (packet Ping) Write(c *Client) error {
	c.Ping.Start = time.Now()
	return nil
}

func (packet Ping) Read(c *Client) error {
	c.Ping.Current = int(utils.GetMilliseconds(time.Now()) - utils.GetMilliseconds(c.Ping.Start))

	return nil
}
