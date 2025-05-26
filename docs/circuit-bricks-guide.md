# Circuit-Bricks Usage Guide

This guide explains how to create and display electrical circuit diagrams in the application using the Circuit-Bricks library.

## Basic Usage

You can create circuit diagrams by using code blocks with the `circuit` or `circuit-bricks` language identifier:

````markdown
```circuit
{
  "components": [
    {
      "id": "bat1",
      "type": "battery",
      "position": { "x": 100, "y": 150 },
      "props": { "voltage": 9 }
    },
    {
      "id": "r1", 
      "type": "resistor",
      "position": { "x": 250, "y": 150 },
      "props": { "resistance": 330 }
    },
    {
      "id": "led1",
      "type": "led",
      "position": { "x": 400, "y": 150 },
      "props": { "color": "#ff0000" }
    },
    {
      "id": "ground1",
      "type": "ground",
      "position": { "x": 250, "y": 250 },
      "props": {}
    }
  ],
  "wires": [
    {
      "id": "w1",
      "from": { "componentId": "bat1", "portId": "positive" },
      "to": { "componentId": "r1", "portId": "left" }
    },
    {
      "id": "w2",
      "from": { "componentId": "r1", "portId": "right" },
      "to": { "componentId": "led1", "portId": "anode" }
    },
    {
      "id": "w3",
      "from": { "componentId": "led1", "portId": "cathode" },
      "to": { "componentId": "ground1", "portId": "terminal" }
    },
    {
      "id": "w4",
      "from": { "componentId": "bat1", "portId": "negative" },
      "to": { "componentId": "ground1", "portId": "terminal" }
    }
  ]
}
```
````

## Interactive Features

The circuit diagrams offer several interactive features:

1. **Component Selection**: Click on any component to view its properties
2. **Zoom and Pan**: Use the mouse wheel to zoom in/out and middle-click/Alt+drag to pan
3. **Reset View**: Click the "Reset View" button to reset zoom and pan settings
4. **Export as PNG**: Save your circuit diagram as an image
5. **Component Catalog**: Browse available components and their properties

## Circuit Structure

A circuit diagram consists of two main parts:

1. **Components**: Electronic parts with properties
2. **Wires**: Connections between component ports

### Components

Each component requires:
- `id`: Unique identifier
- `type`: Component type (see list below)
- `position`: X and Y coordinates
- `props`: Component-specific properties

### Wires

Each wire requires:
- `id`: Unique identifier
- `from`: Source connection (component ID and port)
- `to`: Target connection (component ID and port)

## Supported Component Types

- `resistor`: Basic resistor (props: resistance in ohms)
- `capacitor`: Capacitor (props: capacitance in farads)
- `battery`: DC battery (props: voltage in volts)
- `voltage-source`: Voltage source (props: voltage, isAC)
- `ground`: Ground connection
- `led`: Light-emitting diode (props: color as hex)
- `switch`: Simple switch (props: closed as boolean)
- `inductor`: Inductor (props: inductance in henries)
- `diode`: Diode
- `transistor-npn`: NPN transistor (props: gain)

## Tips for Better Diagrams

1. **Spacing**: Position components at least 100 pixels apart
2. **Straight Wires**: Try to keep wires horizontal or vertical when possible
3. **Organized Layout**: Place components in a logical flow direction (left-to-right or top-to-bottom)
4. **Units**: Use appropriate units (ohms for resistance, volts for voltage)
5. **Component Selection**: Use the component catalog to choose the right component and see its properties

## Examples

The application includes several predefined circuit examples that you can use as templates:

1. LED circuit with resistor
2. Simple resistor with voltage source
3. Voltage divider with two resistors
4. RC filter circuit

## Troubleshooting

If your circuit doesn't render properly:

1. Check that your JSON is valid
2. Ensure all component IDs are unique
3. Verify that wire connections reference valid component IDs and ports
4. Make sure component positions don't overlap
5. Try using the zoom and pan features to view parts of the circuit that might be outside the visible area

## Need Help?

If you need assistance with creating circuit diagrams, please refer to the AI help system which can generate circuit examples and provide guidance on proper circuit structure.
