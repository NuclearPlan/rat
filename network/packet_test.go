package network

import (
	"bytes"
	"fmt"
	"rat/common"
	"reflect"
	"testing"
)

type TestPacket struct {
	Text   string   `both`
	Number int      `both`
	Array  []string `both`
	Sub    struct {
		SubInt int `both`
	} `both`
	Another int `both`
}

func (p TestPacket) Header() common.PacketHeader {
	return 0
}

func (p TestPacket) OnReceive() error {
	return nil
}

func TestPacketSerialization(t *testing.T) {
	test := TestPacket{
		Text:    "Text",
		Number:  15,
		Another: 1,
	}

	test.Sub.SubInt = 10
	test.Array = []string{"test1", "test2"}

	buf := make([]byte, 0)
	b := bytes.NewBuffer(buf)
	writer := Writer{b}

	err := writer.serialize(test)
	if err != nil {
		t.Error(err)
	}

	reader := Reader{b}
	packet, err := reader.deserialize(TestPacket{})
	if err != nil {
		t.Error(err)
	}

	if !reflect.DeepEqual(test, packet) {
		fmt.Println("in", test)
		fmt.Println("out", packet)
		t.Fail()
	}
}

func TestNullSerialization(t *testing.T) {
	test := TestPacket{
		Text: "Text",
	}

	test.Array = []string{"test2"}

	buf := make([]byte, 0)
	b := bytes.NewBuffer(buf)
	writer := Writer{b}

	err := writer.serialize(test)
	if err != nil {
		t.Error(err)
	}

	reader := Reader{b}
	packet, err := reader.deserialize(TestPacket{})
	if err != nil {
		t.Error(err)
	}

	if !reflect.DeepEqual(test, packet) {
		fmt.Println("in", test)
		fmt.Println("out", packet)
		t.Fail()
	}
}

func BenchmarkSerialization(b *testing.B) {
	for i := 0; i < b.N; i++ {
		test := TestPacket{
			Text:    "Text",
			Number:  15,
			Another: 1,
		}

		test.Sub.SubInt = 10
		test.Array = []string{"test1", "test2"}

		buf := make([]byte, 0)
		bd := bytes.NewBuffer(buf)
		writer := Writer{bd}

		err := writer.serialize(test)
		if err != nil {
			b.Error(err)
		}

		reader := Reader{bd}
		packet, err := reader.deserialize(TestPacket{})
		if err != nil {
			b.Error(err)
		}

		if !reflect.DeepEqual(test, packet) {
			b.Fail()
		}
	}
}
