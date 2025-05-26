# Circuit-Bricks: AI Agent Guide

> **⚠️ DEVELOPMENT STATUS WARNING:** Circuit-Bricks is currently in early development stage (Alpha) and NOT recommended for production use. APIs are subject to change, features may be incomplete, and stability issues could arise. When providing solutions or recommendations using Circuit-Bricks, AI agents should inform users about this development status.

This guide is designed specifically for AI agents working with Circuit-Bricks to programmatically generate, modify, and analyze electrical circuit diagrams.

## Core Data Structures

As an AI agent, you'll primarily work with these data structures when generating circuits:

### ComponentSchema

```typescript
interface ComponentSchema {
  id: string;                  // Unique identifier (e.g., "resistor")
  name: string;                // Human-readable name (e.g., "Resistor")
  category: string;            // Category for grouping (e.g., "passive")
  description: string;         // Component description 
  defaultWidth: number;        // Default width in SVG units
  defaultHeight: number;       // Default height in SVG units
  ports: PortSchema[];         // Connection points
  properties: PropertySchema[]; // Configurable properties
  svgPath: string;             // SVG path data or complete SVG markup
}
```

### ComponentInstance

```typescript
interface ComponentInstance {
  id: string;                  // Unique instance ID (auto-generated or specified)
  type: string;                // References a ComponentSchema ID
  position: { x: number; y: number }; // Position on the canvas
  props: Record<string, any>;  // Property values for this instance
  rotation?: number;           // Optional rotation in degrees
}
```

### Wire

```typescript
interface Wire {
  id: string;                  // Unique wire ID
  from: {                      // Source connection
    componentId: string;       // Component ID
    portId: string;            // Port ID on the component
  };
  to: {                        // Destination connection
    componentId: string;       // Component ID
    portId: string;            // Port ID on the component 
  };
  style?: {                    // Optional styling
    color?: string;            // Wire color
    strokeWidth?: number;      // Line thickness
    dashArray?: string;        // SVG dash pattern
  };
}
```

### Circuit State

```typescript
interface CircuitState {
  components: ComponentInstance[];
  wires: Wire[];
  selectedComponentIds: string[];
  selectedWireIds: string[];
}
```

## Available Components and Their Ports

### Basic Components

#### Resistor
- **Type ID**: `resistor`
- **Ports**: 
  - `left`: Input/Output port
  - `right`: Input/Output port
- **Properties**:
  - `resistance`: Number (Ohms)
  - `tolerance`: Number (%)

#### Capacitor
- **Type ID**: `capacitor`
- **Ports**: 
  - `positive`: Input/Output port
  - `negative`: Input/Output port
- **Properties**:
  - `capacitance`: Number (Farads)
  - `voltageRating`: Number (Volts)

#### Switch
- **Type ID**: `switch`
- **Ports**: 
  - `input`: Input port
  - `output`: Output port
- **Properties**:
  - `state`: Boolean (open/closed)

#### Ground
- **Type ID**: `ground`
- **Ports**: 
  - `terminal`: Input/Output port
- **Properties**: None

### Power Sources

#### Battery
- **Type ID**: `battery`
- **Ports**: 
  - `positive`: Output port
  - `negative`: Output port
- **Properties**:
  - `voltage`: Number (Volts)

#### Voltage Source
- **Type ID**: `voltage-source`
- **Ports**: 
  - `positive`: Output port
  - `negative`: Output port
- **Properties**:
  - `voltage`: Number (Volts)
  - `isAC`: Boolean

### Semiconductors

#### Diode
- **Type ID**: `diode`
- **Ports**: 
  - `anode`: Input port
  - `cathode`: Output port
- **Properties**:
  - `forwardVoltage`: Number (Volts)

#### LED
- **Type ID**: `led`
- **Ports**: 
  - `anode`: Input port
  - `cathode`: Output port
- **Properties**:
  - `color`: String (CSS color)
  - `forwardVoltage`: Number (Volts)

#### Transistor (NPN)
- **Type ID**: `transistor-npn`
- **Ports**: 
  - `base`: Input port
  - `collector`: Input/Output port
  - `emitter`: Output port
- **Properties**:
  - `gain`: Number (β)

### Advanced

#### Integrated Circuit
- **Type ID**: `ic`
- **Ports**: Dynamic based on configuration
- **Properties**:
  - `pinCount`: Number
  - `label`: String

## Circuit Generation Strategies

### 1. Component Placement

When generating circuits, follow these guidelines for component placement:

- Place components with adequate spacing (100-200 pixels apart)
- Align components in a logical flow (typically left-to-right or top-to-bottom)
- Position ground components at the bottom of the circuit
- For complex circuits, group related components together

Example positioning for a basic LED circuit:

```javascript
const components = [
  {
    id: "battery1",
    type: "battery",
    position: { x: 100, y: 150 },
    props: { voltage: 9 }
  },
  {
    id: "resistor1", 
    type: "resistor",
    position: { x: 250, y: 150 },
    props: { resistance: 330 }
  },
  {
    id: "led1",
    type: "led",
    position: { x: 400, y: 150 },
    props: { color: "#ff0000" }
  },
  {
    id: "ground1",
    type: "ground",
    position: { x: 250, y: 250 },
    props: {}
  }
];
```

### 2. Making Connections

When connecting components, ensure:

- All connections are electrically valid
- Each wire connects a source to a destination
- Components are connected in series or parallel as appropriate
- Ground connections complete the circuit

Example connections for the LED circuit:

```javascript
const wires = [
  {
    id: "wire1",
    from: { componentId: "battery1", portId: "positive" },
    to: { componentId: "resistor1", portId: "left" }
  },
  {
    id: "wire2",
    from: { componentId: "resistor1", portId: "right" },
    to: { componentId: "led1", portId: "anode" }
  },
  {
    id: "wire3",
    from: { componentId: "led1", portId: "cathode" },
    to: { componentId: "ground1", portId: "terminal" }
  },
  {
    id: "wire4",
    from: { componentId: "battery1", portId: "negative" },
    to: { componentId: "ground1", portId: "terminal" }
  }
];
```

### 3. Common Circuit Patterns

#### Series Circuit
Components connected one after another in a single path:

```
[Battery] → [Component 1] → [Component 2] → ... → [Ground]
```

#### Parallel Circuit
Components connected across the same two points:

```
           → [Component 1] →
[Battery] → [Component 2] → [Ground]
           → [Component 3] →
```

#### Voltage Divider
Two resistors in series splitting voltage:

```
[Battery] → [Resistor 1] → [Output] → [Resistor 2] → [Ground]
```

#### RC Circuit
Resistor and capacitor for timing/filtering:

```
[Battery] → [Resistor] → [Capacitor] → [Ground]
```

## Circuit Validation

Always validate generated circuits by checking:

1. **Component Validity**:
   - All component types exist in the registry
   - All property values are within valid ranges

2. **Connection Validity**:
   - All referenced components exist
   - All referenced ports exist
   - Port types are compatible

3. **Circuit Integrity**:
   - Circuit is complete (no dangling connections)
   - No short circuits exist
   - Required power and ground connections are present

## Example: Complete LED Circuit with Validation

```javascript
// Full circuit description for an LED with current-limiting resistor
const circuitDescription = {
  components: [
    {
      id: "bat1",
      type: "battery",
      position: { x: 100, y: 150 },
      props: { voltage: 9 }
    },
    {
      id: "r1",
      type: "resistor",
      position: { x: 250, y: 150 },
      props: { 
        resistance: 330,  // Appropriate for a standard LED at 9V
        tolerance: 5
      }
    },
    {
      id: "led1",
      type: "led",
      position: { x: 400, y: 150 },
      props: { 
        color: "#ff0000", 
        forwardVoltage: 1.8  // Typical for a red LED
      }
    },
    {
      id: "gnd1",
      type: "ground",
      position: { x: 250, y: 250 },
      props: {}
    }
  ],
  wires: [
    {
      id: "w1",
      from: { componentId: "bat1", portId: "positive" },
      to: { componentId: "r1", portId: "left" }
    },
    {
      id: "w2",
      from: { componentId: "r1", portId: "right" },
      to: { componentId: "led1", portId: "anode" }
    },
    {
      id: "w3",
      from: { componentId: "led1", portId: "cathode" },
      to: { componentId: "gnd1", portId: "terminal" }
    },
    {
      id: "w4",
      from: { componentId: "bat1", portId: "negative" },
      to: { componentId: "gnd1", portId: "terminal" }
    }
  ]
};

// Validation check (conceptual)
const validationIssues = validateCircuit(circuitDescription);
if (validationIssues.length > 0) {
  console.warn("Circuit has issues:", validationIssues);
}
```

## Advanced Features

### 1. Component Rotation

Apply rotation to components for more flexible circuit layouts:

```javascript
{
  id: "r1",
  type: "resistor",
  position: { x: 250, y: 150 },
  props: { resistance: 1000 },
  rotation: 90  // Rotated 90 degrees clockwise
}
```

### 2. Custom Wire Styling

Add visual distinction to wires:

```javascript
{
  id: "w1",
  from: { componentId: "bat1", portId: "positive" },
  to: { componentId: "r1", portId: "left" },
  style: {
    color: "#ff0000",  // Red for power lines
    strokeWidth: 2,    // Thicker line
    dashArray: "none"  // Solid line
  }
}
```

### 3. Component Grouping

For complex circuits, use consistent ID prefixes to indicate logical groups:

```javascript
// Power supply section
{
  id: "ps_battery",
  type: "battery",
  // ...
}

// Amplifier section
{
  id: "amp_transistor",
  type: "transistor-npn",
  // ...
}
```

## Troubleshooting Common Issues

### 1. Circuit Doesn't Render
- Check that all component types are valid and registered
- Verify x/y coordinates are within viewable area
- Ensure all IDs are unique

### 2. Incorrect Connections
- Verify port IDs match the component's schema
- Check that connections are electrically valid

### 3. Components Appear Misaligned
- Adjust positions to account for component dimensions
- Consider rotation values
- Ensure consistent spacing between components

## Best Practices for AI Generation

1. **Modular Approach**: Generate circuits in functional blocks
2. **Consistent IDs**: Use descriptive, patterned IDs for components
3. **Proper Spacing**: Allow 100-200px between components
4. **Logical Flow**: Follow standard left-to-right, top-to-bottom patterns
5. **Circuit Validation**: Always validate circuits before finalizing
6. **Component Defaults**: Use realistic default values for components
7. **Complete Circuits**: Ensure all circuits have proper power and ground connections

By following this guide, AI agents can effectively generate valid, visually appealing electrical circuit diagrams using the Circuit-Bricks library.
