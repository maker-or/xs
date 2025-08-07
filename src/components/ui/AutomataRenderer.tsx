import type React from 'react';
import { useEffect, useRef } from 'react';

interface AutomataRendererProps {
  automata: string;
}

interface State {
  id: string;
  label: string;
  x: number;
  y: number;
  isInitial?: boolean;
  isFinal?: boolean;
}

interface Transition {
  from: string;
  to: string;
  label: string;
}

const AutomataRenderer: React.FC<AutomataRendererProps> = ({ automata }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Parse automata description
  const parseAutomata = (
    input: string
  ): { states: State[]; transitions: Transition[] } => {
    const states: State[] = [];
    const transitions: Transition[] = [];
    const lines = input.trim().split('\n');

    // This is a simple parser - for production use you would want more robust parsing
    lines.forEach((line) => {
      line = line.trim();

      // Parse state definitions
      if (line.startsWith('state')) {
        // Format: state <id> <label> <x> <y> [initial] [final]
        const parts = line.split(/\s+/);
        if (parts.length >= 5 && parts[1] && parts[2] && parts[3] && parts[4]) {
          const state: State = {
            id: parts[1],
            label: parts[2],
            x: Number.parseInt(parts[3] || '0'),
            y: Number.parseInt(parts[4] || '0'),
            isInitial: parts.includes('initial'),
            isFinal: parts.includes('final'),
          };
          states.push(state);
        }
      }
      // Parse transition definitions
      else if (line.startsWith('transition')) {
        // Format: transition <from> <to> <label>
        const parts = line.split(/\s+/);
        if (parts.length >= 4 && parts[1] && parts[2]) {
          transitions.push({
            from: parts[1],
            to: parts[2],
            label: parts.slice(3).join(' '),
          });
        }
      }
    });

    return { states, transitions };
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Set some styling
    ctx.font = '14px Arial';
    ctx.lineWidth = 2;
    ctx.strokeStyle = '#333';
    ctx.fillStyle = '#333';

    // Parse automata description
    const { states, transitions } = parseAutomata(automata);

    // Draw states
    states.forEach((state) => {
      const radius = 30;

      // Draw circle for state
      ctx.beginPath();
      ctx.arc(state.x, state.y, radius, 0, 2 * Math.PI);
      ctx.stroke();

      // Draw second circle if final state
      if (state.isFinal) {
        ctx.beginPath();
        ctx.arc(state.x, state.y, radius - 4, 0, 2 * Math.PI);
        ctx.stroke();
      }

      // Draw initial state arrow
      if (state.isInitial) {
        ctx.beginPath();
        ctx.moveTo(state.x - radius - 20, state.y);
        ctx.lineTo(state.x - radius, state.y);
        ctx.stroke();

        // Draw arrowhead
        ctx.beginPath();
        ctx.moveTo(state.x - radius, state.y);
        ctx.lineTo(state.x - radius - 10, state.y - 5);
        ctx.lineTo(state.x - radius - 10, state.y + 5);
        ctx.fill();
      }

      // Draw state label
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(state.label, state.x, state.y);
    });

    // Draw transitions
    transitions.forEach((transition) => {
      const fromState = states.find((s) => s.id === transition.from);
      const toState = states.find((s) => s.id === transition.to);

      if (!(fromState && toState)) return;

      // Self-transition (loop)
      if (fromState.id === toState.id) {
        const radius = 30;
        ctx.beginPath();
        ctx.arc(fromState.x, fromState.y - radius - 15, 15, 0, 2 * Math.PI);
        ctx.stroke();

        // Draw label above the loop
        ctx.textAlign = 'center';
        ctx.fillText(transition.label, fromState.x, fromState.y - radius - 35);

        // Draw arrowhead
        const angle = 1.5 * Math.PI - 0.5;
        const arrowX = fromState.x + 15 * Math.cos(angle);
        const arrowY = fromState.y - radius - 15 + 15 * Math.sin(angle);

        ctx.beginPath();
        ctx.moveTo(arrowX, arrowY);
        ctx.lineTo(arrowX - 10, arrowY - 5);
        ctx.lineTo(arrowX - 5, arrowY + 8);
        ctx.fill();
      }
      // Regular transition between different states
      else {
        const radius = 30;
        const dx = toState.x - fromState.x;
        const dy = toState.y - fromState.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        // Normalized direction vector
        const nx = dx / distance;
        const ny = dy / distance;

        // Start and end points (on the circles' edges)
        const startX = fromState.x + radius * nx;
        const startY = fromState.y + radius * ny;
        const endX = toState.x - radius * nx;
        const endY = toState.y - radius * ny;

        // Draw the line
        ctx.beginPath();
        ctx.moveTo(startX, startY);
        ctx.lineTo(endX, endY);
        ctx.stroke();

        // Draw arrowhead
        const arrowSize = 10;
        const arrowAngle = Math.atan2(dy, dx);

        ctx.beginPath();
        ctx.moveTo(endX, endY);
        ctx.lineTo(
          endX - arrowSize * Math.cos(arrowAngle - Math.PI / 6),
          endY - arrowSize * Math.sin(arrowAngle - Math.PI / 6)
        );
        ctx.lineTo(
          endX - arrowSize * Math.cos(arrowAngle + Math.PI / 6),
          endY - arrowSize * Math.sin(arrowAngle + Math.PI / 6)
        );
        ctx.fill();

        // Draw transition label (midpoint of the line)
        const midX = (fromState.x + toState.x) / 2;
        const midY = (fromState.y + toState.y) / 2;

        // Offset the label slightly to not overlap with the line
        const perpX = -ny * 15; // Perpendicular to the line direction
        const perpY = nx * 15;

        ctx.textAlign = 'center';
        ctx.fillText(transition.label, midX + perpX, midY + perpY);
      }
    });
  }, [automata]);

  // Match canvas size to desired dimensions or parent container
  return (
    <div className="automata-diagram-container my-4" data-oid="59aifxk">
      <canvas
        className="rounded border bg-white dark:bg-gray-900"
        data-oid="5zqabq5"
        height={400}
        ref={canvasRef}
        width={600}
      />

      <div className="mt-2 text-gray-500 text-sm" data-oid="z.fucwx">
        Finite State Machine / Automaton Diagram
      </div>
    </div>
  );
};

export default AutomataRenderer;
