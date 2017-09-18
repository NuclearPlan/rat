//+build darwin

#import <ApplicationServices/ApplicationServices.h>

#include "screen.h"

void QueryMonitors(void) {
    CGDisplayCount displayCount;
    CGDirectDisplayID displays[32];

    CGGetActiveDisplayList(32, displays, &displayCount);

    for (int i = 0; i < displayCount; i++) {
		CGDirectDisplayID display = displays[i];
		CGImageRef image = CGDisplayCreateImage(display);

		int width = CGDisplayPixelsWide(display);
		int height = CGDisplayPixelsHigh(display);

		Monitor m;

		m.id = display;
		m.coordinates.x = 0;
		m.coordinates.y = 0;
		m.coordinates.width = width;
		m.coordinates.height = height;

		MonitorCallback(m);
    }
}

char *CaptureMonitor(Monitor monitor) {
	CGDisplayCount displayCount;
    CGDirectDisplayID displays[32];
    CGGetActiveDisplayList(32, displays, &displayCount);

	CGDirectDisplayID display;

    for (int i = 0; i < displayCount; i++) {
		CGDirectDisplayID d = displays[i];

		if (d == monitor.id) {
			display = d;
			break;
		}
	}

	CGImageRef image = CGDisplayCreateImage(display);

	CFDataRef data = CGDataProviderCopyData(CGImageGetDataProvider(image));

	return CFDataGetBytePtr(data);
}
