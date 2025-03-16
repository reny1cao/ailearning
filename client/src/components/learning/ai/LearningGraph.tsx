import React, { useEffect, useRef } from "react";
import { Network } from "lucide-react";

interface ConceptNode {
  id: string;
  label: string;
  type: "concept" | "misconception" | "prerequisite" | "example";
}

interface ConceptEdge {
  source: string;
  target: string;
  type: string;
}

interface LearningGraphProps {
  nodes: ConceptNode[];
  edges: ConceptEdge[];
  activeConcept?: string;
  onNodeClick?: (nodeId: string) => void;
}

/**
 * LearningGraph component renders a visual representation of concept relationships
 * using a simple force-directed graph layout
 */
const LearningGraph: React.FC<LearningGraphProps> = ({
  nodes,
  edges,
  activeConcept,
  onNodeClick,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Set up the graph rendering
  useEffect(() => {
    if (!canvasRef.current || !containerRef.current || nodes.length === 0)
      return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Resize canvas to container size
    const resizeCanvas = () => {
      if (containerRef.current) {
        const { width, height } = containerRef.current.getBoundingClientRect();
        canvas.width = width;
        canvas.height = height;
      }
    };

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    // Node positioning and physics variables
    const nodePositions: Record<
      string,
      { x: number; y: number; vx: number; vy: number }
    > = {};

    // Initialize node positions randomly within the canvas
    nodes.forEach((node) => {
      nodePositions[node.id] = {
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: 0,
        vy: 0,
      };
    });

    // Node appearance based on type
    const getNodeStyle = (nodeType: string, isActive: boolean) => {
      switch (nodeType) {
        case "concept":
          return {
            color: isActive ? "#3b82f6" : "#60a5fa",
            radius: isActive ? 25 : 20,
            textColor: "#ffffff",
          };
        case "misconception":
          return {
            color: "#f87171",
            radius: 15,
            textColor: "#ffffff",
          };
        case "prerequisite":
          return {
            color: "#fbbf24",
            radius: 18,
            textColor: "#ffffff",
          };
        case "example":
          return {
            color: "#34d399",
            radius: 15,
            textColor: "#ffffff",
          };
        default:
          return {
            color: "#9ca3af",
            radius: 15,
            textColor: "#ffffff",
          };
      }
    };

    // Edge appearance based on type
    const getEdgeStyle = (edgeType: string) => {
      switch (edgeType) {
        case "prerequisite":
          return {
            color: "#fbbf24",
            width: 2,
            dashed: false,
          };
        case "related":
          return {
            color: "#60a5fa",
            width: 1.5,
            dashed: false,
          };
        case "has_misconception":
          return {
            color: "#f87171",
            width: 1.5,
            dashed: true,
          };
        default:
          return {
            color: "#9ca3af",
            width: 1,
            dashed: false,
          };
      }
    };

    // Animation frame
    let animationFrameId: number;

    // Function to run physics simulation
    const simulateForces = () => {
      // Constants for physics simulation
      const repulsionForce = 500;
      const attractionForce = 0.05;
      const edgeLength = 100;
      const centeringForce = 0.01;
      const damping = 0.8;

      // Apply forces
      nodes.forEach((node1) => {
        const pos1 = nodePositions[node1.id];

        // Centering force
        pos1.vx += (canvas.width / 2 - pos1.x) * centeringForce;
        pos1.vy += (canvas.height / 2 - pos1.y) * centeringForce;

        // Repulsion between nodes
        nodes.forEach((node2) => {
          if (node1.id === node2.id) return;

          const pos2 = nodePositions[node2.id];
          const dx = pos2.x - pos1.x;
          const dy = pos2.y - pos1.y;
          const distance = Math.sqrt(dx * dx + dy * dy) + 0.1; // Adding 0.1 to avoid division by zero

          const force = repulsionForce / (distance * distance);

          // Apply force with direction
          const fx = (dx / distance) * force;
          const fy = (dy / distance) * force;

          pos1.vx -= fx;
          pos1.vy -= fy;
        });
      });

      // Attraction along edges
      edges.forEach((edge) => {
        const pos1 = nodePositions[edge.source];
        const pos2 = nodePositions[edge.target];
        if (!pos1 || !pos2) return;

        const dx = pos2.x - pos1.x;
        const dy = pos2.y - pos1.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        const force = (distance - edgeLength) * attractionForce;

        // Apply force with direction
        const fx = (dx / distance) * force;
        const fy = (dy / distance) * force;

        pos1.vx += fx;
        pos1.vy += fy;
        pos2.vx -= fx;
        pos2.vy -= fy;
      });

      // Update positions
      nodes.forEach((node) => {
        const pos = nodePositions[node.id];

        // Apply damping
        pos.vx *= damping;
        pos.vy *= damping;

        // Update position
        pos.x += pos.vx;
        pos.y += pos.vy;

        // Boundary constraints
        const style = getNodeStyle(node.type, node.id === activeConcept);
        const radius = style.radius;

        pos.x = Math.max(radius, Math.min(canvas.width - radius, pos.x));
        pos.y = Math.max(radius, Math.min(canvas.height - radius, pos.y));
      });
    };

    // Function to draw the graph
    const drawGraph = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw edges
      edges.forEach((edge) => {
        const source = nodePositions[edge.source];
        const target = nodePositions[edge.target];
        if (!source || !target) return;

        const style = getEdgeStyle(edge.type);

        ctx.beginPath();
        ctx.strokeStyle = style.color;
        ctx.lineWidth = style.width;

        if (style.dashed) {
          ctx.setLineDash([5, 3]);
        } else {
          ctx.setLineDash([]);
        }

        ctx.moveTo(source.x, source.y);
        ctx.lineTo(target.x, target.y);
        ctx.stroke();

        // Draw arrow
        const angle = Math.atan2(target.y - source.y, target.x - source.x);
        const arrowSize = 8;

        ctx.beginPath();
        ctx.fillStyle = style.color;
        ctx.setLineDash([]);

        // Calculate arrow position
        const sourceStyle = getNodeStyle(
          nodes.find((n) => n.id === edge.source)?.type || "concept",
          edge.source === activeConcept
        );
        const targetStyle = getNodeStyle(
          nodes.find((n) => n.id === edge.target)?.type || "concept",
          edge.target === activeConcept
        );

        const dx = target.x - source.x;
        const dy = target.y - source.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        // Place arrow slightly before the target node
        const arrowX = target.x - (dx / distance) * (targetStyle.radius + 2);
        const arrowY = target.y - (dy / distance) * (targetStyle.radius + 2);

        ctx.translate(arrowX, arrowY);
        ctx.rotate(angle);
        ctx.moveTo(-arrowSize, -arrowSize / 2);
        ctx.lineTo(0, 0);
        ctx.lineTo(-arrowSize, arrowSize / 2);
        ctx.fill();
        ctx.setTransform(1, 0, 0, 1, 0, 0);
      });

      // Draw nodes
      nodes.forEach((node) => {
        const pos = nodePositions[node.id];
        const style = getNodeStyle(node.type, node.id === activeConcept);

        ctx.beginPath();
        ctx.fillStyle = style.color;
        ctx.arc(pos.x, pos.y, style.radius, 0, Math.PI * 2);
        ctx.fill();

        // Draw label
        ctx.fillStyle = style.textColor;
        ctx.font = "10px Arial";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";

        // Truncate long node labels
        let label = node.label;
        if (label.length > 10) {
          label = label.substring(0, 8) + "...";
        }

        ctx.fillText(label, pos.x, pos.y);
      });
    };

    // Animation loop
    const animate = () => {
      simulateForces();
      drawGraph();
      animationFrameId = requestAnimationFrame(animate);
    };

    // Start animation
    animate();

    // Handle click events
    const handleCanvasClick = (e: MouseEvent) => {
      if (!onNodeClick) return;

      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      // Check if any node was clicked
      for (const node of nodes) {
        const pos = nodePositions[node.id];
        const style = getNodeStyle(node.type, node.id === activeConcept);
        const dx = pos.x - x;
        const dy = pos.y - y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance <= style.radius) {
          onNodeClick(node.id);
          break;
        }
      }
    };

    canvas.addEventListener("click", handleCanvasClick);

    // Cleanup
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", resizeCanvas);
      canvas.removeEventListener("click", handleCanvasClick);
    };
  }, [nodes, edges, activeConcept, onNodeClick]);

  // If there are no nodes, show a placeholder
  if (nodes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-gray-500 dark:text-gray-400 h-64">
        <Network className="w-12 h-12 mb-4 opacity-30" />
        <p className="text-center">
          No concept relationships available to display
        </p>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="w-full h-64 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden relative"
    >
      <canvas ref={canvasRef} className="w-full h-full" />

      {/* Legend */}
      <div className="absolute bottom-2 left-2 bg-white dark:bg-gray-800 p-2 rounded-md shadow-sm text-xs">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-3 h-3 rounded-full bg-blue-400" />
          <span>Concept</span>
        </div>
        <div className="flex items-center gap-2 mb-1">
          <div className="w-3 h-3 rounded-full bg-yellow-400" />
          <span>Prerequisite</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-red-400" />
          <span>Misconception</span>
        </div>
      </div>
    </div>
  );
};

export default LearningGraph;
