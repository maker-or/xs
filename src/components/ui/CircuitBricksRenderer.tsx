import type { ComponentInstance, Wire } from 'circuit-bricks';
import dynamic from 'next/dynamic';
import type React from 'react';
import { useEffect, useMemo, useState } from 'react';

// Dynamic import to avoid SSR issues
const DynamicCircuitCanvas = dynamic(
  () =>
    import('circuit-bricks').then((mod) => ({ default: mod.CircuitCanvas })),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-64 items-center justify-center rounded-lg border bg-gray-50">
        <div className="text-center">
          <div className="mx-auto mb-2 h-8 w-8 animate-spin rounded-full border-blue-600 border-b-2" />
          <p className="text-gray-600">Loading circuit canvas...</p>
        </div>
      </div>
    ),
  }
);

interface CircuitBricksRendererProps {
  circuitData: string;
}

/**
 * Transform circuit data from JSON format to circuit-bricks ComponentInstance format
 */
const transformCircuitData = (
  circuitData: string
): { components: ComponentInstance[]; wires: Wire[] } => {
  try {
    const parsed = JSON.parse(circuitData);

    // Transform components to ComponentInstance format
    const components: ComponentInstance[] = (parsed.components || []).map(
      (comp: {
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
        height: comp.height,
      })
    );

    // Transform wires to circuit-bricks Wire format
    const wires: Wire[] = (parsed.wires || []).map(
      (wire: {
        id: string;
        from: { componentId: string; portId: string };
        to: { componentId: string; portId: string };
        style?: Record<string, unknown>;
      }) => ({
        id: wire.id,
        from: wire.from,
        to: wire.to,
        style: wire.style || {},
      })
    );

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
const CircuitBricksRenderer: React.FC<CircuitBricksRendererProps> = ({
  circuitData,
}) => {
  const [error, setError] = useState<string | null>(null);
  const [selectedComponentIds, setSelectedComponentIds] = useState<string[]>(
    []
  );
  const [selectedWireIds, setSelectedWireIds] = useState<string[]>([]);

  // Transform and memoize circuit data
  const { components, wires } = useMemo(() => {
    try {
      return transformCircuitData(circuitData);
    } catch (error) {
      console.error('Error transforming circuit data:', error);
      setError(
        'Invalid circuit JSON data. Please check your circuit definition.'
      );
      return { components: [], wires: [] };
    }
  }, [circuitData]);

  // Validate circuit data
  useEffect(() => {
    if (components.length) {
      setError(null);
    } else {
      setError('Circuit data must contain at least one component.');
    }
  }, [components]);

  // Event handlers for circuit interactions
  const handleComponentClick = (id: string, event: React.MouseEvent) => {
    event.stopPropagation();
    setSelectedComponentIds((prev) =>
      event.ctrlKey || event.metaKey
        ? prev.includes(id)
          ? prev.filter((cId) => cId !== id)
          : [...prev, id]
        : [id]
    );
  };

  const handleWireClick = (id: string, event: React.MouseEvent) => {
    event.stopPropagation();
    setSelectedWireIds((prev) =>
      event.ctrlKey || event.metaKey
        ? prev.includes(id)
          ? prev.filter((wId) => wId !== id)
          : [...prev, id]
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
      <div className="flex h-64 items-center justify-center rounded-lg border border-red-200 bg-red-50">
        <div className="text-center">
          <div className="mb-2 text-red-500">⚠️</div>
          <p className="font-medium text-red-600">Circuit Error</p>
          <p className="mt-1 text-red-500 text-sm">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className=" overflow-hidden rounded-lg border-2 border-[#42595E] bg-[#42595E]">
      {/* Controls */}
      <div className="flex items-center justify-between border-[#42595E] border-b bg-[#42595E] p-3">
        <div className="flex items-center space-x-2">
          <span className="text-[#E5E7EA] text-sm">
            Components: {components.length} | Wires: {wires.length}
          </span>
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-[#E5E7EA] text-sm">Circuit-Bricks Canvas</span>
        </div>
      </div>

      {/* Circuit Canvas */}
      <div className="relative" style={{ height: '400px' }}>
        <DynamicCircuitCanvas
          components={components}
          gridSize={20}
          height="400px"
          initialZoom={1}
          maxZoom={3}
          minZoom={0.25}
          onCanvasClick={handleCanvasClick}
          onComponentClick={handleComponentClick}
          onWireClick={handleWireClick}
          selectedComponentIds={selectedComponentIds}
          selectedWireIds={selectedWireIds}
          showGrid={true}
          width="100%"
          wires={wires}
        />
      </div>
    </div>
  );
};

export default CircuitBricksRenderer;
