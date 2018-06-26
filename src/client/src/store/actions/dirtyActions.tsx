import * as Events from "../events"

export function PutInDirtyState(propertyId: string) {
    return { type: Events.DEVICE_PROPERTY_DIRTY, payload: propertyId };
}