//+build windows

#include <windows.h>
#include <psapi.h>

#include "window.h"

LPWSTR GetWindowTitle(HWND handle) {
    int length = GetWindowTextLengthA(handle) + 1;

    LPWSTR buffer = (LPWSTR)malloc(length * sizeof(WCHAR));

    GetWindowTextW(handle, buffer, length + 1);

    return buffer;
}

Rect GetWindowDimensions(HANDLE handle) {
    RECT wrect;
    GetWindowRect((HWND) handle, &wrect);

    Rect rect;
    rect.x = wrect.left;
    rect.y = wrect.top;
    rect.width = wrect.right - wrect.left;
    rect.height = wrect.bottom - wrect.top;

    return rect;
}

BOOL CALLBACK EnumWindowsCallback(HWND handle, LPARAM lParam) {
    Frame window;

    window.title = GetWindowTitle(handle);
    window.handle = (HANDLE)handle;
    window.rect = GetWindowDimensions(handle);

    WindowCallback(window);

    free(window.title);

    return TRUE;
}

void QueryWindows(void) {
    EnumWindows(EnumWindowsCallback, 0);
}

void SetWindowPosition(HANDLE handle, Rect rect) {
    MoveWindow((HWND) handle, rect.x, rect.y, rect.width, rect.height, TRUE);
}