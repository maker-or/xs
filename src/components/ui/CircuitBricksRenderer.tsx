import React, { useEffect, useState, useMemo } from 'react';
import dynamic from 'next/dynamic';
import {  ComponentInstance, Wire } from 'circuit-bricks';

// Dynamic import to avoid SSR issues
const DynamicCircuitCanvas = dynamic(() => import('circuit-bricks').then(mod => ({ default: mod.CircuitCanvas })), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-64 bg-gray-50 rounded-lg border">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
        <p className="text-gray-600">Loading circuit canvas...</p>
      </div>
    </div>
  )
});

interface CircuitBricksRendererProps {
  circuitData: string;
}

/**
 * Transform circuit data from JSON format to circuit-bricks ComponentInstance format
 */
const transformCircuitData = (circuitData: string): { components: ComponentInstance[], wires: Wire[] } => {
  try {
    const parsed = JSON.parse(circuitData);

    // Transform components to ComponentInstance format
    const components: ComponentInstance[] = (parsed.components || []).map((comp: {
      id: string;
      type: string;
      position: { x: number; y: number };
      props?: Record<string, unknown>;
      rotation?: number;
      width?: number;
      height?: number;
    }) => ({
      id: comp.id,
      type: comp.type,
      position: comp.position,
      props: comp.props || {},
      rotation: comp.rotation || 0,
      width: comp.width,
      height: comp.height
    }));

    // Transform wires to circuit-bricks Wire format
    const wires: Wire[] = (parsed.wires || []).map((wire: {
      id: string;
      from: { componentId: string; portId: string };
      to: { componentId: string; portId: string };
      style?: Record<string, unknown>;
    }) => ({
      id: wire.id,
      from: wire.from,
      to: wire.to,
      style: wire.style || {}
    }));

    return { components, wires };
  } catch (error) {
    console.error('Error transforming circuit data:', error);
    return { components: [], wires: [] };
  }
};

/**
 * CircuitBricksRenderer component for rendering electrical circuit diagrams
 * using the native Circuit-Bricks library canvas.
 *
 * @param circuitData - JSON string containing circuit description
 */
const CircuitBricksRenderer: React.FC<CircuitBricksRendererProps> = ({ circuitData }) => {
  const [error, setError] = useState<string | null>(null);
  const [selectedComponentIds, setSelectedComponentIds] = useState<string[]>([]);
  const [selectedWireIds, setSelectedWireIds] = useState<string[]>([]);

  // Transform and memoize circuit data
  const { components, wires } = useMemo(() => {
    try {
      return transformCircuitData(circuitData);
    } catch (error) {
      console.error('Error transforming circuit data:', error);
      setError('Invalid circuit JSON data. Please check your circuit definition.');
      return { components: [], wires: [] };
    }
  }, [circuitData]);

  // Validate circuit data
  useEffect(() => {
    if (!components.length) {
      setError('Circuit data must contain at least one component.');
    } else {
      setError(null);
    }
  }, [components]);

  // Event handlers for circuit interactions
  const handleComponentClick = (id: string, event: React.MouseEvent) => {
    event.stopPropagation();
    setSelectedComponentIds(prev =>
      event.ctrlKey || event.metaKey
        ? prev.includes(id) ? prev.filter(cId => cId !== id) : [...prev, id]
        : [id]
    );
  };

  const handleWireClick = (id: string, event: React.MouseEvent) => {
    event.stopPropagation();
    setSelectedWireIds(prev =>
      event.ctrlKey || event.metaKey
        ? prev.includes(id) ? prev.filter(wId => wId !== id) : [...prev, id]
        : [id]
    );
  };

  const handleCanvasClick = () => {
    setSelectedComponentIds([]);
    setSelectedWireIds([]);
  };

  // Get selected component for info panel (currently unused)
  // const selectedComponent = selectedComponentIds.length === 1
  //   ? components.find(c => c.id === selectedComponentIds[0])
  //   : null;

  if (error) {
    return (
      <div className="flex items-center justify-center h-64 bg-red-50 rounded-lg border border-red-200">
        <div className="text-center">
          <div className="text-red-500 mb-2">⚠️</div>
          <p className="text-red-600 font-medium">Circuit Error</p>
          <p className="text-red-500 text-sm mt-1">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="border rounded-lg bg-white overflow-hidden">
      {/* Controls */}
      <div className="flex items-center justify-between p-3 border-b bg-gray-50">
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-600">
            Components: {components.length} | Wires: {wires.length}
          </span>

        </div>

        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-500">
            Circuit-Bricks Canvas
          </span>
        </div>
      </div>

      {/* Circuit Canvas */}
      <div className="relative" style={{ height: '400px' }}>
        <DynamicCircuitCanvas
          components={components}
          wires={wires}
          selectedComponentIds={selectedComponentIds}
          selectedWireIds={selectedWireIds}
          onComponentClick={handleComponentClick}
          onWireClick={handleWireClick}
          onCanvasClick={handleCanvasClick}
          width="100%"
          height="400px"
          showGrid={true}
          gridSize={20}
          initialZoom={1}
          minZoom={0.25}
          maxZoom={3}
        />
      </div>

      {/* Component Info Panel */}
      {/* {selectedComponent && (
        <div className="p-3 border-t bg-blue-50">
          <h4 className="font-medium text-blue-900 mb-2">Selected Component</h4>
          <div className="text-sm space-y-1 text-black">
            <p><span className="font-medium">ID:</span> {selectedComponent.id}</p>
            <p><span className="font-medium">Type:</span> {selectedComponent.type}</p>
            <p><span className="font-medium">Position:</span> ({selectedComponent.position.x}, {selectedComponent.position.y})</p>
            {selectedComponent.props && Object.keys(selectedComponent.props).length > 0 && (
              <div>
                <span className="font-medium">Properties:</span>
                <ul className="ml-4 mt-1">
                  {Object.entries(selectedComponent.props).map(([key, value]) => (
                    <li key={key}>
                      {key}: {String(value)}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )} */}
    </div>
  );
};

export default CircuitBricksRenderer;
