import { Component } from "react";
import { useAuth } from "@clerk/react";
import { ClientSideSuspense, LiveblocksProvider, RoomProvider } from "@liveblocks/react";
import { useLiveblocksFlow } from "@liveblocks/react-flow";
import { Background, BackgroundVariant, ConnectionMode, MiniMap, ReactFlow } from "@xyflow/react";
import { getLiveblocksClient } from "../collaboration/liveblocks-client.js";
import "@xyflow/react/dist/style.css";

function CanvasLoading() {
  return <div className="grid h-full min-h-96 place-items-center bg-base text-sm text-copy-muted" role="status">Connecting to the collaborative canvas...</div>;
}

class CanvasErrorBoundary extends Component {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    return this.state.hasError ? (
      <div className="grid h-full min-h-96 place-items-center bg-base px-6 text-center" role="alert">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-error">Canvas unavailable</p>
          <p className="mt-3 text-sm text-copy-muted">We could not connect to this collaborative canvas.</p>
        </div>
      </div>
    ) : this.props.children;
  }
}

function CanvasFlow() {
  const { nodes, edges, onNodesChange, onEdgesChange, onConnect, onDelete } = useLiveblocksFlow({
    nodes: { initial: [] },
    edges: { initial: [] },
    suspense: true,
  });

  return (
    <div aria-label="Collaborative system design canvas" className="h-full min-h-96 w-full">
      <ReactFlow connectionMode={ConnectionMode.Loose} edges={edges} fitView nodes={nodes} onConnect={onConnect} onDelete={onDelete} onEdgesChange={onEdgesChange} onNodesChange={onNodesChange}>
        <Background color="var(--border-default)" gap={20} size={1} variant={BackgroundVariant.Dots} />
        <MiniMap nodeColor="var(--accent-primary)" />
      </ReactFlow>
    </div>
  );
}

export function CollaborativeCanvas({ projectId }) {
  const { getToken } = useAuth();
  const client = getLiveblocksClient(getToken);

  return (
    <CanvasErrorBoundary>
      <LiveblocksProvider client={client}>
        <RoomProvider id={projectId} initialPresence={{ cursor: null, isThinking: false }}>
          <ClientSideSuspense fallback={<CanvasLoading />}><CanvasFlow /></ClientSideSuspense>
        </RoomProvider>
      </LiveblocksProvider>
    </CanvasErrorBoundary>
  );
}
