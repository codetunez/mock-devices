export class DtdlStore {

    public getListOfItems = () => {
        return ['mockDevices']
    }

    public getDtdl = (type: string) => {
        switch (type) {
            case 'mockDevices':
                return [
                    {
                        "@id": "dtmi:codetunez:root;1",
                        "@type": "Interface",
                        "contents": [
                            {
                                "@id": "dtmi:codetunez:root:battery;1",
                                "@type": "Telemetry",
                                "displayName": {
                                    "en": "battery"
                                },
                                "name": "battery",
                                "schema": "double"
                            },
                            {
                                "@id": "dtmi:codetunez:root:fan;1",
                                "@type": "Telemetry",
                                "displayName": {
                                    "en": "fan"
                                },
                                "name": "fan",
                                "schema": "double"
                            },
                            {
                                "@id": "dtmi:codetunez:root:hotplate;1",
                                "@type": "Telemetry",
                                "displayName": {
                                    "en": "hotplate"
                                },
                                "name": "hotplate",
                                "schema": "double"
                            },
                            {
                                "@id": "dtmi:codetunez:root:random;1",
                                "@type": "Telemetry",
                                "displayName": {
                                    "en": "random"
                                },
                                "name": "random",
                                "schema": "double"
                            },
                            {
                                "@id": "dtmi:codetunez:root:inc;1",
                                "@type": "Telemetry",
                                "displayName": {
                                    "en": "inc"
                                },
                                "name": "inc",
                                "schema": "double"
                            },
                            {
                                "@id": "dtmi:codetunez:root:dec;1",
                                "@type": "Telemetry",
                                "displayName": {
                                    "en": "dec"
                                },
                                "name": "dec",
                                "schema": "double"
                            },
                            {
                                "@id": "dtmi:codetunez:root:cextended;1",
                                "@type": "Component",
                                "displayName": {
                                    "en": "Extended"
                                },
                                "name": "cextended",
                                "schema": "dtmi:codetunez:iextended;1"
                            }
                        ],
                        "displayName": {
                            "en": "mock-device"
                        },
                        "extends": [
                            "dtmi:codetunez:icommand;1",
                            "dtmi:codetunez:iproperty;1"
                        ],
                        "@context": [
                            "dtmi:iotcentral:context;2",
                            "dtmi:dtdl:context;2"
                        ]
                    },
                    {
                        "@context": [
                            "dtmi:iotcentral:context;2",
                            "dtmi:dtdl:context;2"
                        ],
                        "@id": "dtmi:codetunez:icommand;1",
                        "@type": "Interface",
                        "contents": [
                            {
                                "@id": "dtmi:codetunez:icommand:reboot;1",
                                "@type": "Command",
                                "commandType": "synchronous",
                                "displayName": {
                                    "en": "reboot"
                                },
                                "name": "reboot",
                                "response": {
                                    "@id": "dtmi:codetunez:icommand:reboot:__response:res;1",
                                    "@type": "CommandPayload",
                                    "displayName": {
                                        "en": "res"
                                    },
                                    "name": "res",
                                    "schema": {
                                        "@id": "dtmi:codetunez:icommand:reboot:__response:res:schema;1",
                                        "@type": "Object",
                                        "displayName": {
                                            "en": "Object"
                                        },
                                        "fields": [
                                            {
                                                "@id": "dtmi:codetunez:icommand:reboot:__response:res:schema:result;1",
                                                "displayName": {
                                                    "en": "result"
                                                },
                                                "name": "result",
                                                "schema": "string"
                                            }
                                        ]
                                    }
                                }
                            },
                            {
                                "@id": "dtmi:codetunez:icommand:firmware;1",
                                "@type": "Command",
                                "commandType": "synchronous",
                                "displayName": {
                                    "en": "firmware"
                                },
                                "name": "firmware",
                                "response": {
                                    "@id": "dtmi:codetunez:icommand:firmware:__response:res;1",
                                    "@type": "CommandPayload",
                                    "displayName": {
                                        "en": "res"
                                    },
                                    "name": "res",
                                    "schema": {
                                        "@id": "dtmi:codetunez:icommand:firmware:__response:res:schema;1",
                                        "@type": "Object",
                                        "displayName": {
                                            "en": "Object"
                                        },
                                        "fields": [
                                            {
                                                "@id": "dtmi:codetunez:icommand:firmware:__response:res:schema:result;1",
                                                "displayName": {
                                                    "en": "result"
                                                },
                                                "name": "result",
                                                "schema": "string"
                                            }
                                        ]
                                    }
                                }
                            },
                            {
                                "@id": "dtmi:codetunez:icommand:shutdown;1",
                                "@type": "Command",
                                "commandType": "synchronous",
                                "displayName": {
                                    "en": "shutdown"
                                },
                                "name": "shutdown",
                                "response": {
                                    "@id": "dtmi:codetunez:icommand:shutdown:__response:res;1",
                                    "@type": "CommandPayload",
                                    "displayName": {
                                        "en": "res"
                                    },
                                    "name": "res",
                                    "schema": {
                                        "@id": "dtmi:codetunez:icommand:shutdown:__response:res:schema;1",
                                        "@type": "Object",
                                        "displayName": {
                                            "en": "Object"
                                        },
                                        "fields": [
                                            {
                                                "@id": "dtmi:codetunez:icommand:shutdown:__response:res:schema:result;1",
                                                "displayName": {
                                                    "en": "result"
                                                },
                                                "name": "result",
                                                "schema": "string"
                                            }
                                        ]
                                    }
                                }
                            }
                        ],
                        "displayName": {
                            "en": "Commands"
                        }
                    },
                    {
                        "@context": [
                            "dtmi:iotcentral:context;2",
                            "dtmi:dtdl:context;2"
                        ],
                        "@id": "dtmi:codetunez:iproperty;1",
                        "@type": "Interface",
                        "contents": [
                            {
                                "@id": "dtmi:codetunez:iproperty:info;1",
                                "@type": "Property",
                                "displayName": {
                                    "en": "info"
                                },
                                "name": "info",
                                "schema": "string",
                                "writable": false
                            },
                            {
                                "@id": "dtmi:codetunez:iproperty:location;1",
                                "@type": [
                                    "Property",
                                    "Location"
                                ],
                                "displayName": {
                                    "en": "location"
                                },
                                "name": "location",
                                "schema": "geopoint",
                                "writable": false
                            },
                            {
                                "@id": "dtmi:codetunez:iproperty:setting;1",
                                "@type": "Property",
                                "displayName": {
                                    "en": "setting"
                                },
                                "name": "setting",
                                "schema": "string",
                                "writable": true
                            },
                            {
                                "@id": "dtmi:codetunez:iproperty:complex;1",
                                "@type": "Property",
                                "displayName": {
                                    "en": "complex"
                                },
                                "name": "complex",
                                "schema": {
                                    "@id": "dtmi:codetunez:iproperty:complex:schema;1",
                                    "@type": "Object",
                                    "displayName": {
                                        "en": "Object"
                                    },
                                    "fields": [
                                        {
                                            "@id": "dtmi:codetunez:iproperty:complex:schema:compDbl;1",
                                            "displayName": {
                                                "en": "compDbl"
                                            },
                                            "name": "compDbl",
                                            "schema": "double"
                                        },
                                        {
                                            "@id": "dtmi:codetunez:iproperty:complex:schema:compStr;1",
                                            "displayName": {
                                                "en": "compStr"
                                            },
                                            "name": "compStr",
                                            "schema": "string"
                                        },
                                        {
                                            "@id": "dtmi:codetunez:iproperty:complex:schema:compBln;1",
                                            "displayName": {
                                                "en": "compBln"
                                            },
                                            "name": "compBln",
                                            "schema": "boolean"
                                        }
                                    ]
                                },
                                "writable": true
                            }
                        ],
                        "displayName": {
                            "en": "Properties"
                        }
                    },
                    {
                        "@context": [
                            "dtmi:iotcentral:context;2",
                            "dtmi:dtdl:context;2"
                        ],
                        "@id": "dtmi:codetunez:iextended;1",
                        "@type": "Interface",
                        "contents": [
                            {
                                "@id": "dtmi:codetunez:iextended:enum;1",
                                "@type": "Telemetry",
                                "displayName": {
                                    "en": "enum"
                                },
                                "name": "enum",
                                "schema": {
                                    "@id": "dtmi:codetunez:iextended:enum:schema;1",
                                    "@type": "Enum",
                                    "displayName": {
                                        "en": "Enum"
                                    },
                                    "enumValues": [
                                        {
                                            "@id": "dtmi:codetunez:iextended:enum:schema:alpha;1",
                                            "displayName": {
                                                "en": "Alpha"
                                            },
                                            "enumValue": "a",
                                            "name": "alpha"
                                        },
                                        {
                                            "@id": "dtmi:codetunez:iextended:enum:schema:bravo;1",
                                            "displayName": {
                                                "en": "Bravo"
                                            },
                                            "enumValue": "b",
                                            "name": "bravo"
                                        },
                                        {
                                            "@id": "dtmi:codetunez:iextended:enum:schema:charlie;1",
                                            "displayName": {
                                                "en": "Charlie"
                                            },
                                            "enumValue": "c",
                                            "name": "charlie"
                                        }
                                    ],
                                    "valueSchema": "string"
                                }
                            },
                            {
                                "@id": "dtmi:codetunez:iextended:eventInfo;1",
                                "@type": [
                                    "Telemetry",
                                    "Event"
                                ],
                                "displayName": {
                                    "en": "eventInfo"
                                },
                                "name": "eventInfo",
                                "schema": "string"
                            },
                            {
                                "@id": "dtmi:codetunez:iextended:hashMap;1",
                                "@type": "Property",
                                "displayName": {
                                    "en": "hashMap"
                                },
                                "name": "hashMap",
                                "schema": {
                                    "@id": "dtmi:codetunez:iextended:hashMap:schema;1",
                                    "@type": "Map",
                                    "displayName": {
                                        "en": "Map"
                                    },
                                    "mapKey": {
                                        "@id": "dtmi:codetunez:iextended:hashMap:schema:mapKey:key;1",
                                        "displayName": {
                                            "en": "key"
                                        },
                                        "name": "key",
                                        "schema": "string"
                                    },
                                    "mapValue": {
                                        "@id": "dtmi:codetunez:iextended:hashMap:schema:mapValue:value;1",
                                        "displayName": {
                                            "en": "value"
                                        },
                                        "name": "value",
                                        "schema": {
                                            "@id": "dtmi:codetunez:iextended:hashMap:schema:mapValue:value:schema;1",
                                            "@type": "Object",
                                            "displayName": {
                                                "en": "Object"
                                            },
                                            "fields": [
                                                {
                                                    "@id": "dtmi:codetunez:iextended:hashMap:schema:mapValue:value:schema:propDbl;1",
                                                    "displayName": {
                                                        "en": "propDbl"
                                                    },
                                                    "name": "propDbl",
                                                    "schema": "double"
                                                },
                                                {
                                                    "@id": "dtmi:codetunez:iextended:hashMap:schema:mapValue:value:schema:propStr;1",
                                                    "displayName": {
                                                        "en": "propStr"
                                                    },
                                                    "name": "propStr",
                                                    "schema": "string"
                                                },
                                                {
                                                    "@id": "dtmi:codetunez:iextended:hashMap:schema:mapValue:value:schema:propBln;1",
                                                    "displayName": {
                                                        "en": "propBln"
                                                    },
                                                    "name": "propBln",
                                                    "schema": "boolean"
                                                }
                                            ]
                                        }
                                    }
                                },
                                "writable": true
                            },
                            {
                                "@id": "dtmi:codetunez:iextended:boolean;1",
                                "@type": "Telemetry",
                                "displayName": {
                                    "en": "boolean"
                                },
                                "name": "boolean",
                                "schema": "boolean"
                            },
                            {
                                "@id": "dtmi:codetunez:iextended:heartbeat;1",
                                "@type": "Telemetry",
                                "displayName": {
                                    "en": "heartbeat"
                                },
                                "name": "heartbeat",
                                "schema": "dateTime"
                            }
                        ],
                        "displayName": {
                            "en": "IComponent"
                        }
                    }
                ]
            default:
                return [];
        }
    }
}