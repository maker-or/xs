# Circuit-Bricks Documentation

> **⚠️ DEVELOPMENT STATUS WARNING:** Circuit-Bricks is currently in early development stage (Alpha) and NOT recommended for production use. APIs are subject to change, features may be incomplete, and stability issues could arise. Use at your own risk for experimental or learning purposes only.

## Overview

Circuit-Bricks is a React + TypeScript library that provides a modular, Lego-style system for creating interactive SVG-based electrical circuit diagrams. The library is designed with an AI-first approach, making it easy for both humans and AI agents to create, modify, and understand circuit diagrams through a well-defined JSON schema.

## Table of Contents

1. [Development Status](#development-status)
2. [Architecture](#architecture)
3. [Core Components](#core-components)
4. [Component Registry](#component-registry)
5. [Hooks](#hooks)
6. [UI Components](#ui-components)
   - [Styled Components](#property-panel)
   - [Headless Components](#headless-ui-components)
7. [Utilities](#utilities)
8. [Usage Examples](#usage-examples)
   - [Basic Circuit](#basic-circuit)
   - [Interactive Editor](#interactive-editor)
   - [Advanced Circuit Examples](#advanced-circuit-examples)
9. [Component Schema Reference](#component-schema-reference)
10. [API Reference](#api-reference)
11. [Performance Optimization](#performance-optimization)
12. [Recent Additions (Phase 3 & 4)](#recent-additions-phase-3--4)
13. [Implementation Details](#implementation-details)
14. [Best Practices](#best-practices)
15. [Conclusion](#conclusion)

## Development Status

Circuit-Bricks is currently in **early development stage (Alpha)** and should not be used in production environments. Here's what you need to know:

### Current Limitations

- **API Stability**: The API is not stable and may change without prior notice
- **Feature Completeness**: Some features are still in development or may be missing
- **Testing**: While we have test coverage, real-world usage and edge cases may reveal issues
- **Performance**: Performance optimizations are ongoing
- **Browser Compatibility**: May not work correctly in all browsers or versions
- **Documentation**: Some documentation may be incomplete or outdated

### Recommended Usage

- **Experimentation**: Suitable for experiments and proof-of-concepts
- **Learning**: Good for learning about circuit diagram libraries and React/TypeScript integration
- **Contributing**: Ideal for developers who want to contribute to the library's development
- **Feedback**: We welcome feedback on issues, features, and improvements

### Development Roadmap

1. **Alpha Phase** (Current)
   - Core functionality implementation
   - Basic component library
   - Testing infrastructure

2. **Beta Phase** (Upcoming)
   - API stabilization
   - Complete documentation
   - Performance optimizations
   - Browser compatibility improvements

3. **Release Candidate**
   - Feature-complete with stabilized APIs
   - Comprehensive testing
   - Production readiness audit

4. **General Availability**
   - Production-ready with semantic versioning
   - Long-term support

We welcome contributions and feedback from early adopters, but please be aware of the current limitations before integrating Circuit-Bricks into any project requiring stability or production-level reliability.

## Architecture

Circuit-Bricks follows a modular architecture consisting of several layers:

1. **Core Layer**: Defines the fundamental types and interfaces used throughout the library.
2. **Schema Layer**: Provides ZOD schemas for runtime validation of component schemas and circuit states.
3. **Registry Layer**: Manages component schemas and their registration.
4. **Rendering Layer**: Includes React components for rendering circuit elements.
5. **State Management Layer**: Provides hooks for managing circuit state.
6. **UI Layer**: Offers optional UI components for editing and interacting with circuits.

### Directory Structure

```
src/
├─ index.ts                 # Main exports
├─ types.ts                 # Core type definitions
├─ schemas/                 # ZOD schema definitions
│  └─ componentSchema.ts    # ZOD schemas for component types
├─ core/                    # Core rendering components
│  ├─ BaseComponent.tsx     # Base SVG rendering
│  ├─ Brick.tsx             # Schema to component mapper
│  ├─ Port.tsx              # Port rendering
│  ├─ WirePath.tsx          # Wire path rendering
│  └─ CircuitCanvas.tsx     # Main canvas component
├─ registry/                # Component schema registry
│  ├─ index.ts              # Registry API
│  └─ components/           # Component schema definitions
│     ├─ resistor.json      # Example component schema
│     └─ ...
├─ hooks/                   # React hooks
│  ├─ useCircuit.ts         # Circuit state management
│  └─ usePortPosition.ts    # Port position tracking
├─ ui/                      # Optional UI components
│  ├─ PropertyPanel.tsx     # Component property editor
│  ├─ ComponentPalette.tsx  # Component selection palette
│  ├─ CircuitToolbar.tsx    # Actions toolbar
│  └─ headless/             # Headless (unstyled) components
│     ├─ HeadlessPropertyPanel.tsx
│     ├─ HeadlessComponentPalette.tsx
│     └─ HeadlessCircuitToolbar.tsx
└─ utils/                   # Utility functions
   ├─ getPortPosition.ts    # DOM position helpers
   ├─ circuitValidation.ts  # Circuit validation utilities
   └─ zodValidation.ts      # ZOD schema validation utilities
```

## Core Components

### CircuitCanvas

The `CircuitCanvas` is the main component that renders the circuit. It acts as a container for all circuit elements (components and wires) and handles user interactions like selection and clicking.

```tsx
<CircuitCanvas
  components={circuitState.components}
  wires={circuitState.wires}
  selectedComponentIds={circuitState.selectedComponentIds}
  selectedWireIds={circuitState.selectedWireIds}
  onComponentClick={handleComponentClick}
  onWireClick={handleWireClick}
  onCanvasClick={handleCanvasClick}
  width="800px"
  height="600px"
/>
```

### BaseComponent

`BaseComponent` is responsible for rendering an SVG representation of a circuit component based on its schema and instance properties. It handles:

- SVG path rendering
- Component positioning and rotation
- Port positioning
- Selection highlighting

### Brick

`Brick` is a wrapper around `BaseComponent` that handles schema lookups and error states. It ensures that even if a component schema is missing, the UI doesn't break but rather displays a placeholder with an error message.

### Port

`Port` renders connection points on components. Each port has:
- A unique ID
- A type (input, output, or bidirectional)
- A position within the component
- Data attributes for DOM querying

### WirePath

`WirePath` renders connections between component ports. It:
- Calculates the path between two ports
- Renders SVG paths or lines
- Handles styling and selection state
- Uses DOM querying to find exact port positions

## Component Registry

The registry system manages component schemas and provides utilities for registration and retrieval. It's designed to be extensible, allowing users to register custom components.

## Component Registry System

The registry is a core part of Circuit-Bricks that manages component schemas and provides a centralized system for component registration and retrieval.

### Registry Module

```typescript
/**
 * Registry module for component schemas
 *
 * This module provides utilities for registering, retrieving, and managing component schemas.
 * The component registry is a central repository of all available component types that can
 * be used in circuits. Each component is defined by a schema that specifies its appearance,
 * ports, and configurable properties.
 */

/**
 * Register a component schema in the registry
 *
 * @param {ComponentSchema} schema - The component schema to register
 *
 * @example
 * // Register a custom LED component
 * registerComponent({
 *   id: 'custom-led',
 *   name: 'Custom LED',
 *   category: 'output',
 *   description: 'A light-emitting diode with customizable color',
 *   defaultWidth: 30,
 *   defaultHeight: 20,
 *   ports: [
 *     { id: 'anode', x: 0, y: 10, type: 'input' },
 *     { id: 'cathode', x: 30, y: 10, type: 'output' }
 *   ],
 *   properties: [
 *     { id: 'color', name: 'Color', type: 'color', default: '#ff0000' }
 *   ],
 *   svgPath: `<circle cx="15" cy="10" r="8" fill="currentColor" />`
 * });
 */
function registerComponent(schema: ComponentSchema): void;

/**
 * Get a component schema from the registry by ID
 *
 * @param {string} id - The unique identifier of the component
 * @returns {ComponentSchema | undefined} The component schema or undefined if not found
 */
function getComponentSchema(id: string): ComponentSchema | undefined;

/**
 * Get all component schemas in the registry
 *
 * @returns {ComponentSchema[]} Array of all registered component schemas
 */
function getAllComponents(): ComponentSchema[];

/**
 * Get component schemas filtered by category
 *
 * @param {string} category - The category to filter by
 * @returns {ComponentSchema[]} Array of component schemas in the specified category
 */
function getComponentsByCategory(category: string): ComponentSchema[];
```

### Component Schema Type Definition

```typescript
/**
 * Complete schema definition for a circuit component
 *
 * The ComponentSchema defines everything about a component type:
 * - Visual representation (SVG path)
 * - Connection points (ports)
 * - Configurable properties
 * - Default dimensions
 *
 * This schema is used to register components in the component registry
 * and serves as a blueprint for creating component instances.
 */
export interface ComponentSchema {
  /** Unique identifier for the component type */
  id: string;

  /** Display name shown in UI */
  name: string;

  /** Category for grouping similar components */
  category: string;

  /** Detailed description of the component */
  description: string;

  /** Default width in pixels */
  defaultWidth: number;

  /** Default height in pixels */
  defaultHeight: number;

  /** Array of port definitions */
  ports: PortSchema[];

  /** Array of configurable property definitions */
  properties: PropertySchema[];

  /** SVG path data for rendering the component */
  svgPath: string;
}
```

### Built-in Components

Circuit-Bricks includes several built-in components:

1. **Basic**:
   - Resistor
   - Capacitor
   - Switch
   - Ground

2. **Sources**:
   - Battery
   - Voltage Source

3. **Semiconductors**:
   - Diode
   - Transistor (NPN)
   - LED

4. **Advanced**:
   - Integrated Circuit (IC)

### Registry API

The registry provides these key functions:

- `registerComponent(schema)`: Register a new component schema
- `getComponentSchema(id)`: Get a component schema by ID
- `getAllComponents()`: Get all registered component schemas
- `getComponentsByCategory(category)`: Get components by category

## Hooks

### useCircuit

`useCircuit` is the primary hook for managing circuit state. It provides:

```typescript
const [circuitState, actions] = useCircuit(initialState);
```

Where `circuitState` contains:
- `components`: Array of component instances
- `wires`: Array of wire connections
- `selectedComponentIds`: IDs of selected components
- `selectedWireIds`: IDs of selected wires

And `actions` includes methods for:
- Adding, updating, and removing components
- Adding, updating, and removing wires
- Selecting and deselecting elements

Example:

```tsx
const [circuit, { addComponent, addWire }] = useCircuit();

// Add a resistor
const resistorId = addComponent({
  type: 'resistor',
  position: { x: 100, y: 100 },
  props: { resistance: 220 }
});

// Add a wire
addWire(
  { componentId: 'battery-1', portId: 'positive' },
  { componentId: resistorId, portId: 'left' }
);
```

### usePortPosition

`usePortPosition` tracks the DOM positions of ports for wire rendering. It's used internally by the `WirePath` component but can also be used directly for custom wire rendering or interactive features.

```typescript
const { from, to, error } = usePortPosition(wire);
```

## UI Components

### PropertyPanel

`PropertyPanel` provides a UI for editing component properties. It dynamically generates form controls based on the component's property schema.

```tsx
<PropertyPanel
  component={selectedComponent}
  onPropertyChange={handlePropertyChange}
/>
```

### ComponentPalette

`ComponentPalette` displays available components grouped by category and allows users to search and select components to add to the circuit.

```tsx
<ComponentPalette onSelectComponent={handleSelectComponent} />
```

### CircuitToolbar

`CircuitToolbar` provides buttons for common operations like delete, copy, undo, redo, zoom, etc.

```tsx
<CircuitToolbar
  onAction={handleToolbarAction}
  hasSelection={hasSelectedElements}
  canUndo={canUndo}
  canRedo={canRedo}
/>
```

### Headless UI Components

Circuit-Bricks provides headless (unstyled) versions of all UI components, allowing you to fully customize the appearance using your preferred styling method.

#### HeadlessPropertyPanel

```tsx
<HeadlessPropertyPanel
  component={selectedComponent}
  onPropertyChange={handlePropertyChange}
  className="custom-panel"
  classNames={{
    header: "custom-header",
    title: "custom-title"
  }}
  style={{ backgroundColor: '#ffffff' }}
  styles={{
    header: { padding: '16px' },
    title: { fontSize: '18px' }
  }}
/>
```

#### HeadlessComponentPalette

```tsx
<HeadlessComponentPalette
  onSelectComponent={handleSelectComponent}
  className="custom-palette"
  classNames={{
    header: "custom-header",
    searchInput: "custom-search"
  }}
  style={{ backgroundColor: '#ffffff' }}
  styles={{
    header: { padding: '16px' },
    searchInput: { borderRadius: '8px' }
  }}
/>
```

#### HeadlessCircuitToolbar

```tsx
<HeadlessCircuitToolbar
  onAction={handleToolbarAction}
  hasSelection={hasSelectedElements}
  canUndo={canUndo}
  canRedo={canRedo}
  className="custom-toolbar"
  classNames={{
    group: "custom-group",
    button: "custom-button"
  }}
  style={{ backgroundColor: '#ffffff' }}
  styles={{
    group: { padding: '8px' },
    button: { borderRadius: '4px' }
  }}
/>
```

For more details on using headless components, see the [Headless Components](./HEADLESS-COMPONENTS.md) documentation.

## ZOD Schemas

Circuit-Bricks uses [Zod](https://github.com/colinhacks/zod) for runtime type validation. Zod is a TypeScript-first schema declaration and validation library that allows us to define schemas for our data structures and validate them at runtime.

### Schema Definitions

The ZOD schemas are defined in `src/schemas/componentSchema.ts` and provide validation for all the core types in the library:

```typescript
// Basic types
export const portTypeSchema = z.enum(['input', 'output', 'inout']);
export const pointSchema = z.object({ x: z.number(), y: z.number() });
export const sizeSchema = z.object({ width: z.number(), height: z.number() });

// Component schemas
export const portSchema = z.object({
  id: z.string(),
  x: z.number(),
  y: z.number(),
  type: portTypeSchema,
  label: z.string().optional(),
});

export const propertySchema = z.object({
  key: z.string(),
  label: z.string(),
  type: z.enum(['number', 'boolean', 'select', 'text', 'color']),
  unit: z.string().optional(),
  options: z.array(
    z.object({
      value: z.any(),
      label: z.string(),
    })
  ).optional(),
  default: z.any(),
  min: z.number().optional(),
  max: z.number().optional(),
});

export const componentSchema = z.object({
  id: z.string(),
  name: z.string(),
  category: z.string(),
  description: z.string(),
  defaultWidth: z.number(),
  defaultHeight: z.number(),
  ports: z.array(portSchema),
  properties: z.array(propertySchema),
  svgPath: z.string(),
});

// Circuit elements
export const componentInstanceSchema = z.object({
  id: z.string(),
  type: z.string(),
  position: pointSchema,
  size: sizeSchema.optional(),
  props: z.record(z.any()),
  rotation: z.number().optional(),
});

export const wireSchema = z.object({
  id: z.string(),
  from: z.object({
    componentId: z.string(),
    portId: z.string(),
  }),
  to: z.object({
    componentId: z.string(),
    portId: z.string(),
  }),
  style: z.object({
    color: z.string().optional(),
    strokeWidth: z.number().optional(),
    dashArray: z.string().optional(),
  }).optional(),
});

export const circuitStateSchema = z.object({
  components: z.array(componentInstanceSchema),
  wires: z.array(wireSchema),
  selectedComponentIds: z.array(z.string()),
  selectedWireIds: z.array(z.string()),
});
```

### Validation Utilities

The library provides several validation utilities in `src/utils/zodValidation.ts`:

```typescript
// Validate a component schema
const result = validateComponentSchema(schema);
if (result.success) {
  // Use the validated schema
  const validatedSchema = result.data;
} else {
  console.error('Invalid schema:', result.error);
}

// Validate a component instance
const result = validateComponentInstance(instance);

// Validate a wire connection
const result = validateWire(wire);

// Validate a complete circuit state
const result = validateCircuitState(circuit);
```

### Integration with Registry

The component registry uses ZOD validation when registering components:

```typescript
// In src/registry/index.ts
export function registerComponent(schema: ComponentSchema): void {
  // Validate the schema using ZOD
  const validationResult = validateComponentSchema(schema);

  if (!validationResult.success) {
    throw new Error(`Invalid component schema: ${validationResult.error}`);
  }

  // Register the component if validation passes
  componentRegistry[schema.id] = schema;
}
```

### Integration with Circuit Validation

The circuit validation utility uses ZOD validation for the circuit structure:

```typescript
// In src/utils/circuitValidation.ts
export function validateCircuit(circuit: CircuitState): ValidationIssue[] {
  // First validate the circuit structure using ZOD
  const validationResult = validateCircuitState(circuit);

  if (!validationResult.success) {
    return [{
      type: 'error',
      message: `Invalid circuit structure: ${validationResult.error}`
    }];
  }

  // Perform additional validation checks
  // ...
}
```

## Utilities

### getPortPosition

`getPortPosition` calculates the absolute position of a port in the SVG coordinate system by querying the DOM.

```typescript
const position = getPortPosition(componentId, portId);
// { x: 123, y: 456 }
```

### validateCircuit

`validateCircuit` checks for common issues in a circuit:
- Missing component references in wires
- Floating inputs/outputs
- Short circuits (multiple outputs connected)

```typescript
const issues = validateCircuit(circuitState);
// [{ type: 'error', message: '...', componentId: '...' }, ...]
```

## Usage Examples

### Basic Circuit

```tsx
import React, { useEffect } from 'react';
import { CircuitCanvas, useCircuit } from 'circuit-bricks';

const SimpleCircuit = () => {
  const [circuit, { addComponent, addWire }] = useCircuit();

  useEffect(() => {
    // Create a simple circuit on mount
    const batteryId = addComponent({
      type: 'battery',
      position: { x: 50, y: 100 },
      props: { voltage: 9 }
    });

    const resistorId = addComponent({
      type: 'resistor',
      position: { x: 150, y: 100 },
      props: { resistance: 220 }
    });

    const ledId = addComponent({
      type: 'led',
      position: { x: 250, y: 100 },
      props: { color: '#ff0000', forwardVoltage: 1.8 }
    });

    const groundId = addComponent({
      type: 'ground',
      position: { x: 150, y: 200 },
      props: {}
    });

    // Connect components
    addWire(
      { componentId: batteryId, portId: 'positive' },
      { componentId: resistorId, portId: 'left' }
    );

    addWire(
      { componentId: resistorId, portId: 'right' },
      { componentId: ledId, portId: 'anode' }
    );

    addWire(
      { componentId: ledId, portId: 'cathode' },
      { componentId: groundId, portId: 'terminal' }
    );

    addWire(
      { componentId: batteryId, portId: 'negative' },
      { componentId: groundId, portId: 'terminal' }
    );
  }, []);

  return (
    <CircuitCanvas
      components={circuit.components}
      wires={circuit.wires}
      width="100%"
      height="400px"
    />
  );
};
```

### Interactive Editor

```tsx
import React from 'react';
import {
  CircuitCanvas,
  useCircuit,
  PropertyPanel,
  ComponentPalette,
  CircuitToolbar
} from 'circuit-bricks';

const CircuitEditor = () => {
  const [state, actions] = useCircuit();
  const {
    addComponent,
    updateComponent,
    removeComponent,
    selectComponent,
    deselectAll
  } = actions;

  const handleSelectComponent = (type) => {
    addComponent({
      type,
      position: { x: 200, y: 200 },
      props: {}
    });
  };

  const handleToolbarAction = (action) => {
    if (action === 'delete') {
      state.selectedComponentIds.forEach(id => removeComponent(id));
    }
    // Handle other actions...
  };

  const handlePropertyChange = (id, key, value) => {
    updateComponent(id, {
      props: {
        ...state.components.find(c => c.id === id)?.props,
        [key]: value
      }
    });
  };

  const selectedComponent = state.selectedComponentIds.length > 0
    ? state.components.find(c => c.id === state.selectedComponentIds[0])
    : null;

  return (
    <div className="circuit-editor">
      <CircuitToolbar
        onAction={handleToolbarAction}
        hasSelection={state.selectedComponentIds.length > 0}
      />

      <div className="editor-main">
        <ComponentPalette onSelectComponent={handleSelectComponent} />

        <CircuitCanvas
          components={state.components}
          wires={state.wires}
          selectedComponentIds={state.selectedComponentIds}
          onComponentClick={selectComponent}
          onCanvasClick={deselectAll}
          width="800px"
          height="600px"
        />

        <PropertyPanel
          component={selectedComponent}
          onPropertyChange={handlePropertyChange}
        />
      </div>
    </div>
  );
};
```

### Advanced Circuit Examples

#### Voltage Regulator Circuit

```tsx
import React from 'react';
import { CircuitCanvas, useCircuit } from 'circuit-bricks';

const VoltageRegulatorExample = () => {
  const [state, actions] = useCircuit();

  React.useEffect(() => {
    // Add components
    const batteryId = actions.addComponent({
      type: 'battery',
      position: { x: 100, y: 100 },
      props: { voltage: 9 }
    });

    const regulatorId = actions.addComponent({
      type: 'ic',
      position: { x: 300, y: 100 },
      props: {
        name: '7805',
        pins: 3,
        width: 60,
        height: 40
      }
    });

    const inputCapId = actions.addComponent({
      type: 'capacitor',
      position: { x: 200, y: 150 },
      props: { capacitance: 100, unit: 'µF' }
    });

    const outputCapId = actions.addComponent({
      type: 'capacitor',
      position: { x: 400, y: 150 },
      props: { capacitance: 10, unit: 'µF' }
    });

    const loadResistorId = actions.addComponent({
      type: 'resistor',
      position: { x: 500, y: 100 },
      props: { resistance: 1000 }
    });

    // Add ground and wire connections
    const groundId = actions.addComponent({
      type: 'ground',
      position: { x: 300, y: 200 },
      props: {}
    });

    // Connect components with wires
    actions.addWire(
      { componentId: batteryId, portId: 'positive' },
      { componentId: regulatorId, portId: 'input' }
    );

    actions.addWire(
      { componentId: regulatorId, portId: 'output' },
      { componentId: loadResistorId, portId: 'left' }
    );

    actions.addWire(
      { componentId: loadResistorId, portId: 'right' },
      { componentId: groundId, portId: 'terminal' }
    );

    actions.addWire(
      { componentId: batteryId, portId: 'negative' },
      { componentId: groundId, portId: 'terminal' }
    );
  }, []);

  return (
    <CircuitCanvas
      components={state.components}
      wires={state.wires}
      width="700px"
      height="400px"
      showGrid={true}
    />
  );
};
```

#### 555 Timer LED Blinker Circuit

```tsx
import React from 'react';
import { CircuitCanvas, useCircuit } from 'circuit-bricks';

const TimerCircuitExample = () => {
  const [state, actions] = useCircuit();

  React.useEffect(() => {
    // Add components
    const timerICId = actions.addComponent({
      type: 'ic',
      position: { x: 300, y: 150 },
      props: {
        name: '555',
        pins: 8,
        width: 80,
        height: 100
      }
    });

    const resistor1Id = actions.addComponent({
      type: 'resistor',
      position: { x: 200, y: 50 },
      props: { resistance: 10, unit: 'kΩ' }
    });

    const resistor2Id = actions.addComponent({
      type: 'resistor',
      position: { x: 400, y: 50 },
      props: { resistance: 100, unit: 'kΩ' }
    });

    const capacitorId = actions.addComponent({
      type: 'capacitor',
      position: { x: 200, y: 250 },
      props: { capacitance: 10, unit: 'µF' }
    });

    const ledId = actions.addComponent({
      type: 'led',
      position: { x: 500, y: 150 },
      props: { color: '#ff0000' }
    });

    // Connect components with wires
    actions.addWire(
      { componentId: timerICId, portId: 'out' },
      { componentId: ledId, portId: 'anode' }
    );

    actions.addWire(
      { componentId: ledId, portId: 'cathode' },
      { componentId: timerICId, portId: 'gnd' }
    );

    // ...additional components and wire connections
  }, []);

  return (
    <CircuitCanvas
      components={state.components}
      wires={state.wires}
      width="700px"
      height="500px"
      showGrid={true}
    />
  );
};
```

## Component Schema Reference

### Resistor Schema

```json
{
  "id": "resistor",
  "name": "Resistor",
  "category": "passive",
  "description": "A passive two-terminal component that implements electrical resistance",
  "defaultWidth": 80,
  "defaultHeight": 30,
  "ports": [
    {
      "id": "left",
      "x": 0,
      "y": 15,
      "type": "inout"
    },
    {
      "id": "right",
      "x": 80,
      "y": 15,
      "type": "inout"
    }
  ],
  "properties": [
    {
      "key": "resistance",
      "label": "Resistance",
      "type": "number",
      "unit": "Ω",
      "default": 1000,
      "min": 0
    },
    {
      "key": "tolerance",
      "label": "Tolerance",
      "type": "number",
      "unit": "%",
      "default": 5,
      "min": 0,
      "max": 20
    }
  ],
  "svgPath": "M10,15 h10 l5,-10 l10,20 l10,-20 l10,20 l10,-20 l5,10 h10"
}
```

### Creating Custom Components

To create a custom component:

1. Define a schema object (JSON)
2. Register it with the registry

```tsx
import { registerComponent } from 'circuit-bricks';

const myCustomComponent = {
  id: 'custom-op-amp',
  name: 'Op-Amp',
  category: 'integrated',
  description: 'Operational Amplifier',
  defaultWidth: 60,
  defaultHeight: 60,
  ports: [
    { id: 'in+', x: 0, y: 20, type: 'input' },
    { id: 'in-', x: 0, y: 40, type: 'input' },
    { id: 'out', x: 60, y: 30, type: 'output' },
    { id: 'vcc', x: 30, y: 0, type: 'input' },
    { id: 'gnd', x: 30, y: 60, type: 'input' }
  ],
  properties: [
    { key: 'gain', label: 'Gain', type: 'number', default: 100000 }
  ],
  svgPath: "M10,10 l0,40 l40,-20 z"
};

registerComponent(myCustomComponent);
```

## API Reference

### Core Types

#### ComponentInstance

```typescript
interface ComponentInstance {
  id: string;               // Unique instance ID
  type: string;             // Component type (schema ID)
  position: Point;          // {x, y} position
  size?: Size;              // Optional {width, height}
  props: Record<string, any>; // Component properties
  rotation?: number;        // Optional rotation in degrees
}
```

#### Wire

```typescript
interface Wire {
  id: string;               // Unique wire ID
  from: {                   // Source connection
    componentId: string;    // Component ID
    portId: string;         // Port ID
  };
  to: {                     // Destination connection
    componentId: string;    // Component ID
    portId: string;         // Port ID
  };
  style?: {                 // Optional styling
    color?: string;
    strokeWidth?: number;
    dashArray?: string;
  };
}
```

#### CircuitState

```typescript
interface CircuitState {
  components: ComponentInstance[];   // Component instances
  wires: Wire[];                     // Wire connections
  selectedComponentIds: string[];    // Selected component IDs
  selectedWireIds: string[];         // Selected wire IDs
}
```

### Public API

#### Core Components

- `CircuitCanvas`: Main canvas component
- `Brick`: Schema-based component renderer
- `BaseComponent`: SVG component renderer
- `Port`: Port renderer
- `WirePath`: Wire path renderer

#### Hooks

- `useCircuit`: Circuit state management
- `usePortPosition`: Port position tracking

#### Registry Utilities

- `registerComponent`: Register a component schema
- `getComponentSchema`: Get a schema by ID
- `getAllComponents`: Get all schemas
- `getComponentsByCategory`: Filter schemas by category

#### UI Components

- `PropertyPanel`: Property editor
- `ComponentPalette`: Component selector
- `CircuitToolbar`: Action toolbar

#### Utilities

- `validateCircuit`: Circuit validation
- `getPortPosition`: DOM position helper

## Implementation Details

### Port Position Calculation

Port positions are calculated using DOM queries in the `getPortPosition` utility. This approach:

1. Queries the DOM for elements with matching `data-component-id` and `data-port-id` attributes
2. Gets the bounding client rect
3. Transforms the coordinates to the SVG coordinate system

This calculation is essential for accurate wire rendering and connections.

### Wire Path Generation

Wire paths are generated in the `WirePath` component using the port positions. The paths can be:

1. Straight lines (for horizontal connections)
2. Bezier curves (for vertical connections)

### Component Rendering

Components are rendered using a multi-layered approach:

1. `CircuitCanvas` renders the overall SVG container
2. `Brick` maps component instances to schemas
3. `BaseComponent` renders the actual SVG based on the schema
4. `Port` renders connection points

### State Management

Circuit state is managed using the `useCircuit` hook, which provides a centralized state store with actions for manipulating the circuit. The state includes:

1. Component instances
2. Wire connections
3. Selection state

## Best Practices

### Performance Optimization

- Use `React.memo` for pure components
- Minimize DOM queries for port positions
- Use the `usePortPosition` hook for cached positions
- Implement virtualization for large circuits

### Custom Component Creation

When creating custom components:

1. Use vector-based SVG paths for scalability
2. Define proper port positions for connections
3. Use meaningful property names and defaults
4. Group related components by category

### Wire Rendering

For optimal wire rendering:

1. Use `vector-effect="non-scaling-stroke"` for consistent line width
2. Implement proper path generation for different orientations
3. Consider connection angles for natural-looking circuits

## Conclusion

Circuit-Bricks provides a comprehensive framework for creating interactive circuit diagrams in React applications. Its modular architecture, JSON-based schema system, and AI-friendly design make it suitable for a wide range of applications, from educational tools to professional circuit design software.

By leveraging the power of SVG and React, Circuit-Bricks enables developers to create rich, interactive circuit experiences with minimal effort. The library is designed to be extensible, allowing for custom components, styling, and behaviors to meet specific application needs.

**Important Reminder**: As stated at the beginning of this documentation, Circuit-Bricks is currently in early development stage (Alpha) and is not recommended for production use. We encourage you to experiment with the library, provide feedback, and contribute to its development, but please exercise caution when considering it for critical or production applications until a stable release is announced.

## Performance Optimization

### Bundle Size

Circuit-Bricks is optimized for performance and has a small footprint:

- Minified bundle size: ~64KB
- Gzipped size: ~22KB

### Rendering Optimization Techniques

For optimal performance when working with large or complex circuits:

1. **Component Memoization**

   All core components use React.memo to prevent unnecessary re-renders:

   ```tsx
   const Brick = React.memo(({ component, ...props }: BrickProps) => {
     // Component implementation
   });
   ```

2. **Virtualization for Large Circuits**

   When working with very large circuits (100+ components), consider implementing virtualization to render only the components currently in view:

   ```tsx
   // Example using a visibility check function
   const visibleComponents = components.filter(comp =>
     isInViewport(comp.position, viewportBounds)
   );
   ```

3. **Selective Updates**

   The useCircuit hook implements selective updates to avoid re-renders when properties not affecting rendering change:

   ```tsx
   // Only trigger re-render for position changes
   updateComponent(id, { position: newPosition }, { silent: true });
   ```

4. **SVG Optimization**

   All SVG paths are optimized for performance using techniques like:
   - Path data optimization
   - Use of simple geometric shapes where possible
   - Avoiding complex gradients and effects

5. **Batch Updates**

   When making multiple changes to the circuit state, batch them to prevent multiple re-renders:

   ```tsx
   // Better approach - one update
   actions.batchUpdates(() => {
     addComponent(component1);
     addComponent(component2);
     addWire(wire1);
   });
   ```

6. **Lazy Loading Components**

   For applications with many different circuit examples or component types, consider lazy loading:

   ```tsx
   const VoltageRegulatorExample = React.lazy(() =>
     import('./examples/VoltageRegulatorExample')
   );
   ```

## Recent Additions (Phase 3 & 4)

This section documents the latest features and improvements added during Phases 3 & 4 of development.

### Phase 3: UI & Interaction

1. **Component Selection**
   - Selection highlighting
   - Multi-select capabilities
   - Selection persistence

2. **Wire Drawing**
   - Interactive wire creation
   - Port connection validation
   - Wire path optimization

3. **Property Editing**
   - Dynamic property form generation
   - Real-time component updates
   - Type-specific input controls

4. **Circuit Validation**
   - Connection validity checks
   - Circuit completion verification
   - Error highlighting

### Phase 4: Polish & Documentation

1. **Performance Optimization**
   - Bundle size reduction (current ~64KB minified)
   - Component memoization
   - Selective rendering updates

2. **JSDoc Documentation**
   - Comprehensive API documentation
   - Component interface documentation
   - Hook usage examples

3. **Example Circuits**
   - Voltage Regulator (7805)
   - 555 Timer LED Blinker
   - Interactive Editor
   - Simple Circuit

4. **Testing**
   - Component rendering tests
   - Wire connection tests
   - Circuit validation tests
   - State management tests

5. **Type Definitions**
   - Enhanced TypeScript interfaces
   - Prop type documentation
   - Action type safety

## Core Component Documentation

### CircuitCanvas Component

The CircuitCanvas is the main component that renders circuit components and wires. It now supports an infinite canvas with panning and zooming capabilities, allowing users to create circuits of any size and complexity.

```typescript
/**
 * CircuitCanvas Component
 *
 * The main canvas component that renders circuit components and wires.
 * Supports infinite panning and zooming for a free-flowing design experience.
 *
 * @component
 * @example
 * <CircuitCanvas
 *   components={state.components}
 *   wires={state.wires}
 *   width={800}
 *   height={600}
 *   onComponentClick={handleComponentClick}
 *   showGrid={true}
 *   initialZoom={1.0}
 * />
 */
```

### CircuitCanvas Props Interface

```typescript
export interface CircuitCanvasProps {
  /** Array of component instances to render on the canvas */
  components: ComponentInstance[];

  /** Array of wires connecting components */
  wires: Wire[];

  /** Width of the canvas. Can be a number (pixels) or string (e.g., '100%') */
  width?: number | string;

  /** Height of the canvas. Can be a number (pixels) or string (e.g., '100%') */
  height?: number | string;

  /** Callback when a component is clicked */
  onComponentClick?: (id: string, event: React.MouseEvent) => void;

  /** Callback when a wire is clicked */
  onWireClick?: (id: string, event: React.MouseEvent) => void;

  /** Callback when the canvas background is clicked */
  onCanvasClick?: (event: React.MouseEvent) => void;

  /** Callback when a component is dragged to a new position */
  onComponentDrag?: (id: string, newPosition: Point) => void;

  /** Callback when wire drawing starts from a port */
  onWireDrawStart?: (componentId: string, portId: string) => void;

  /** Callback when wire drawing ends on a port. Return true to accept the connection. */
  onWireDrawEnd?: (componentId: string, portId: string) => boolean;

  /** Callback when wire drawing is canceled */
  onWireDrawCancel?: () => void;

  /** Object representing the current wire drawing state */
  wireDrawing?: {
    isDrawing: boolean;
    fromComponentId: string | null;
    fromPortId: string | null;
  };

  /** Array of currently selected component IDs */
  selectedComponentIds?: string[];

  /** Array of currently selected wire IDs */
  selectedWireIds?: string[];

  /** Whether to show the grid on the canvas */
  showGrid?: boolean;

  /** Size of the grid cells in pixels */
  gridSize?: number;

  /** Whether to snap components to the grid */
  snapToGrid?: boolean;

  /** Callback when a component is dropped onto the canvas */
  onComponentDrop?: (componentType: string, position: Point) => void;

  /** Initial zoom level for the canvas (1.0 = 100%) */
  initialZoom?: number;

  /** Minimum allowed zoom level */
  minZoom?: number;

  /** Maximum allowed zoom level */
  maxZoom?: number;
}
```

### Infinite Canvas Features

The CircuitCanvas now supports an infinite canvas with intuitive navigation controls:

#### Pan and Zoom Controls
- **Panning**: Hold Alt key + drag, or use middle mouse button to pan around the canvas
- **Zooming**: Use Ctrl/⌘ + mouse wheel to zoom in and out
- **Reset View**: Press Ctrl/⌘ + 0 to reset the view to default position and zoom level
- **Arrow Navigation**: Use Alt + Arrow keys to pan in specific directions (with Shift for faster movement)

#### Visual Navigation Aids
- **Minimap**: A small overview map in the bottom-right corner shows your current viewport position
- **Zoom Controls**: On-screen buttons for zooming in, out, and resetting the view
- **Grid Adaptation**: The grid pattern automatically adjusts based on zoom level for better visualization

#### API Options
- `initialZoom`: Set the starting zoom level (default is 1.0)
- `minZoom`: Configure the minimum zoom level (default is 0.25)
- `maxZoom`: Configure the maximum zoom level (default is 3.0)

#### Programmatic Control
The viewport transformation is exposed through events, allowing you to:
- Listen for viewport changes
- Programmatically set the viewport position and zoom
- Integrate with other components for coordinated views

#### Example Usage
```tsx
<CircuitCanvas
  components={components}
  wires={wires}
  width="100%"
  height="100%"
  onComponentClick={handleComponentClick}
  showGrid={true}
  initialZoom={0.8}
  minZoom={0.2}
  maxZoom={5.0}
/>
```

### useCircuit Hook

```typescript
/**
 * useCircuit Hook
 *
 * A React hook for managing circuit state and operations. Provides a complete
 * state management solution for circuit components and wires, with support for
 * selection, wire drawing, and undo/redo functionality.
 *
 * @returns {[CircuitState, CircuitActions]} A tuple containing the current circuit state and actions to modify it
 *
 * @example
 * const [state, actions] = useCircuit();
 *
 * // Add a new component
 * const resistorId = actions.addComponent({
 *   type: 'resistor',
 *   position: { x: 100, y: 100 },
 *   props: { resistance: 1000 }
 * });
 *
 * // Connect components with a wire
 * actions.addWire(
 *   { componentId: resistorId, portId: 'left' },
 *   { componentId: 'battery-1', portId: 'positive' }
 * );
 *
 * // Access current state
 * console.log(state.components, state.wires);
 */
```

### CircuitActions Interface

```typescript
export interface CircuitActions {
  /** Adds a new component to the circuit and returns its generated ID */
  addComponent: (component: Omit<ComponentInstance, 'id'>) => string;

  /** Updates properties of an existing component */
  updateComponent: (id: string, updates: Partial<ComponentInstance>) => void;

  /** Removes a component from the circuit */
  removeComponent: (id: string) => void;

  /** Adds a new wire between two ports and returns its generated ID */
  addWire: (from: Wire['from'], to: Wire['to'], style?: Wire['style']) => string;

  /** Updates properties of an existing wire */
  updateWire: (id: string, updates: Partial<Wire>) => void;

  /** Removes a wire from the circuit */
  removeWire: (id: string) => void;

  /** Selects a component by ID */
  selectComponent: (id: string) => void;

  /** Selects a wire by ID */
  selectWire: (id: string) => void;

  /** Deselects all components and wires */
  deselectAll: () => void;

  /** Undoes the last action */
  undo: () => void;

  /** Redoes a previously undone action */
  redo: () => void;
}
```
