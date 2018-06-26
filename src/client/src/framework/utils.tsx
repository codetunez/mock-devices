export function FormatJSON(json: any) {
    return JSON.stringify(json, null, 2).replace("\"_VALUE_\"", "_VALUE_")
}
