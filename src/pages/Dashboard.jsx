import ReactFlow, {
  Background,
  Controls,
  addEdge,
  updateEdge,
  useNodesState,
  useEdgesState,
  ReactFlowProvider,
} from "reactflow";
import "reactflow/dist/style.css";

// import TextUpdaterNode from "../components/TextUpdaterNode";
import "../../src/text-updater-node.css";
// import CustomNode from "../components/CustomNode";

import { useState, useCallback, useRef } from "react";
// import CustomNode from "../components/CustomNode";
import Sidebar from "../components/Sidebar";
import { Button, HStack, Input } from "@chakra-ui/react";

const initialNodes = [
  {
    id: "1",
    type: "input",
    data: { label: "input node" },
    position: { x: 250, y: 5 },
  },
];

let id = 0;
const getId = () => `dndnode_${id++}`;

// const initialEdges = [];

// const nodeTypes = { textUpdater: TextUpdaterNode, custom: CustomNode };

export default function Dashboard() {
  const reactFlowWrapper = useRef(null);
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [reactFlowInstance, setReactFlowInstance] = useState(null);

  // Edit state variables
  const [editValue, setEditValue] = useState(nodes.data);
  const [id, setId] = useState();
  const [editing, setEditing] = useState(false);
  const [selectedEdgeId, setSelectedEdgeId] = useState(null);

  const edgeUpdateSuccessful = useRef(true);

  const onNodeClick = (event, node) => {
    setId(node.id);
    setEditValue(node.data.label);
    setEditing(true);
  };

  const handleChange = (event) => {
    event.preventDefault();
    setEditValue(event.target.value);
  };

  const handleEdit = () => {
    const res = nodes.map((node) => {
      if (node.id === id) {
        node.data = {
          ...node.data,
          label: editValue,
        };
      }
      return node;
    });
    setNodes(res);
    setEditValue("");
    setEditing(false);
  };

  const handleDeleteNode = (nodeId) => {
    setNodes((nds) => nds.filter((node) => node.id !== nodeId));
  };

  {
    /** Edges */
  }
  const handleDeleteEdge = (edgeId) => {
    setEdges((eds) => eds.filter((edge) => edge.id !== edgeId));
  };

  const onEdgeClick = (edge) => {
    setSelectedEdgeId(edge.id);
  };

  const onEdgeUpdateStart = useCallback(() => {
    edgeUpdateSuccessful.current = false;
  }, []);

  const onEdgeUpdate = useCallback((oldEdge, newConnection) => {
    edgeUpdateSuccessful.current = true;
    setEdges((els) => updateEdge(oldEdge, newConnection, els));
  }, []);

  const onEdgeUpdateEnd = useCallback((_, edge) => {
    if (!edgeUpdateSuccessful.current) {
      setEdges((eds) => eds.filter((e) => e.id !== edge.id));
    }

    edgeUpdateSuccessful.current = true;
  }, []);

  const onConnect = useCallback(
    (params) => setEdges((eds) => addEdge(params, eds)),
    []
  );

  const onDragOver = useCallback((event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  }, []);

  const onDrop = useCallback(
    (event) => {
      event.preventDefault();

      const type = event.dataTransfer.getData("application/reactflow");

      // check if the dropped element is valid
      if (typeof type === "undefined" || !type) {
        return;
      }

      // reactFlowInstance.project was renamed to reactFlowInstance.screenToFlowPosition
      // and you don't need to subtract the reactFlowBounds.left/top anymore
      // details: https://reactflow.dev/whats-new/2023-11-10
      const position = reactFlowInstance.screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });
      const newNode = {
        id: getId(),
        type,
        position,
        data: { label: `${type} node` },
      };

      setNodes((nds) => nds.concat(newNode));
    },
    [reactFlowInstance]
  );

  return (
    <div className="dndflow" style={{ height: "100vh", width: "100%" }}>
      {editing && (
        <div className="flex flex-col gap-4 p-5">
          <label htmlFor="text">Text:</label>
          <Input
            type="text"
            name="text"
            id="text"
            placeholder="Text"
            value={editValue}
            onChange={handleChange}
          />
          <HStack>
            <Button onClick={handleEdit}>Update</Button>
            <Button onClick={() => handleDeleteNode(id)} colorScheme="red">
              Delete
            </Button>
          </HStack>
        </div>
      )}

      <ReactFlowProvider>
        <div className="reactflow-wrapper" ref={reactFlowWrapper}>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodeClick={(event, node) => onNodeClick(event, node)}
            onEdgeClick={onEdgeClick}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onEdgeUpdate={onEdgeUpdate}
            onEdgeUpdateStart={onEdgeUpdateStart}
            onEdgeUpdateEnd={onEdgeUpdateEnd}
            onConnect={onConnect}
            onInit={setReactFlowInstance}
            onDrop={onDrop}
            onDragOver={onDragOver}
            fitView
          >
            <Controls />
            <Background />
          </ReactFlow>
          <Button onClick={() => handleDeleteEdge(selectedEdgeId)}>
            Delete Edge
          </Button>
        </div>
        <Sidebar />
      </ReactFlowProvider>
    </div>
  );
}
