// eventEmitter.ts
type EventCallback = (...args: any[]) => void;

class EventEmitter {
    private events: { [key: string]: EventCallback[] } = {};

    on(event: string, listener: EventCallback) {
        if (!this.events[event]) {
            this.events[event] = [];
        }
        this.events[event].push(listener);
    }

    emit(event: string, ...args: any[]) {
        if (this.events[event]) {
            this.events[event].forEach((listener) => listener(...args));
        }
    }

    off(event: string, listener: EventCallback) {
        if (!this.events[event]) return;

        this.events[event] = this.events[event].filter(l => l !== listener);
    }
}

export default EventEmitter;
