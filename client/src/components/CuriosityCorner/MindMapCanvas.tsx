import React, { useState, useRef, useEffect } from 'react';
import GlowingEffect from '../ui/GlowingEffect';
import SectionHeader from '../ui/SectionHeader';
import { Brain, Trash2, Link2, X, Save, Upload, Undo, Redo, ZoomIn, ZoomOut, Type, Palette, FileText, ChevronLeft, ChevronRight, Edit2, Check, X as XIcon } from 'lucide-react';

interface Node {
  id: string;
  text: string;
  x: number;
  y: number;
  color: string;
  size: 'small' | 'medium' | 'large';
  icon?: string;
}

interface Connection {
  id: string;
  from: string;
  to: string;
  label?: string;
  style: 'solid' | 'dashed' | 'dotted';
  weight: number;
}

interface MindMapState {
  nodes: Node[];
  connections: Connection[];
}

interface ActionLog {
  id: string;
  timestamp: number;
  action: string;
  details: string;
}

const NODE_COLORS = [
  {
    name: 'Violet',
    gradient: 'from-violet-500/20 to-fuchsia-500/20',
    from: '#8b5cf6',
    to: '#d946ef'
  },
  {
    name: 'Blue',
    gradient: 'from-blue-500/20 to-cyan-500/20',
    from: '#3b82f6',
    to: '#06b6d4'
  },
  {
    name: 'Emerald',
    gradient: 'from-emerald-500/20 to-teal-500/20',
    from: '#10b981',
    to: '#14b8a6'
  },
  {
    name: 'Amber',
    gradient: 'from-amber-500/20 to-orange-500/20',
    from: '#f59e0b',
    to: '#f97316'
  },
  {
    name: 'Rose',
    gradient: 'from-rose-500/20 to-pink-500/20',
    from: '#f43f5e',
    to: '#ec4899'
  }
];

const NODE_SIZES = {
  small: 'p-2 text-sm',
  medium: 'p-4 text-base',
  large: 'p-6 text-lg',
};

const MindMapCanvas: React.FC = () => {
  const [nodes, setNodes] = useState<Node[]>([]);
  const [connections, setConnections] = useState<Connection[]>([]);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [startNode, setStartNode] = useState<string | null>(null);
  const [scale, setScale] = useState(1);
  const [history, setHistory] = useState<MindMapState[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const canvasRef = useRef<HTMLDivElement>(null);
  const [actionLogs, setActionLogs] = useState<ActionLog[]>([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [editingNode, setEditingNode] = useState<string | null>(null);
  const [editText, setEditText] = useState('');

  // Save current state to history
  const saveToHistory = (newState: MindMapState) => {
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(newState);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };

  // Undo/Redo functions
  const undo = () => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      const state = history[newIndex];
      setNodes(state.nodes);
      setConnections(state.connections);
    }
  };

  const redo = () => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      const state = history[newIndex];
      setNodes(state.nodes);
      setConnections(state.connections);
    }
  };

  // Add action to log
  const addActionLog = (action: string, details: string) => {
    const newLog: ActionLog = {
      id: Date.now().toString(),
      timestamp: Date.now(),
      action,
      details,
    };
    setActionLogs(prev => [newLog, ...prev]);
  };

  // Save/Load functions
  const saveMindMap = () => {
    const mindMapData = {
      nodes,
      connections,
    };
    localStorage.setItem('mindMapData', JSON.stringify(mindMapData));
    addActionLog('Mind Map Saved', 'Saved current mind map state');
  };

  const loadMindMap = () => {
    const savedData = localStorage.getItem('mindMapData');
    if (savedData) {
      const { nodes: savedNodes, connections: savedConnections } = JSON.parse(savedData);
      setNodes(savedNodes);
      setConnections(savedConnections);
      saveToHistory({ nodes: savedNodes, connections: savedConnections });
      addActionLog('Mind Map Loaded', `Loaded mind map with ${savedNodes.length} nodes and ${savedConnections.length} connections`);
    }
  };

  const addNode = (x: number, y: number) => {
    const newNode: Node = {
      id: Date.now().toString(),
      text: 'New Node',
      x,
      y,
      color: NODE_COLORS[Math.floor(Math.random() * NODE_COLORS.length)].gradient,
      size: 'medium',
    };
    const newNodes = [...nodes, newNode];
    setNodes(newNodes);
    saveToHistory({ nodes: newNodes, connections });
    addActionLog('Node Added', `Added new node "${newNode.text}"`);
  };

  const deleteNode = (nodeId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const nodeToDelete = nodes.find(n => n.id === nodeId);
    const newNodes = nodes.filter(node => node.id !== nodeId);
    const newConnections = connections.filter(
      conn => conn.from !== nodeId && conn.to !== nodeId
    );
    setNodes(newNodes);
    setConnections(newConnections);
    if (selectedNode === nodeId) {
      setSelectedNode(null);
    }
    saveToHistory({ nodes: newNodes, connections: newConnections });
    addActionLog('Node Deleted', `Deleted node "${nodeToDelete?.text}"`);
  };

  const updateNodeStyle = (nodeId: string, updates: Partial<Node>) => {
    const node = nodes.find(n => n.id === nodeId);
    const newNodes = nodes.map(n =>
      n.id === nodeId ? { ...n, ...updates } : n
    );
    setNodes(newNodes);
    saveToHistory({ nodes: newNodes, connections });
    
    if (updates.size) {
      addActionLog('Node Size Changed', `Changed size of "${node?.text}" to ${updates.size}`);
    }
    if (updates.color) {
      addActionLog('Node Color Changed', `Changed color of "${node?.text}"`);
    }
  };

  const handleNodeDrag = (nodeId: string, e: React.MouseEvent) => {
    if (!isDragging) return;

    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    const newNodes = nodes.map(node => {
      if (node.id === nodeId) {
        return {
          ...node,
          x: e.clientX - rect.left,
          y: e.clientY - rect.top,
        };
      }
      return node;
    });
    setNodes(newNodes);
    saveToHistory({ nodes: newNodes, connections });
  };

  const handleNodeMouseDown = (nodeId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedNode(nodeId);
    setIsDragging(true);
  };

  const handleNodeMouseUp = (nodeId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (isConnecting && startNode && startNode !== nodeId) {
      const fromNode = nodes.find(n => n.id === startNode);
      const toNode = nodes.find(n => n.id === nodeId);
      const newConnection: Connection = {
        id: Date.now().toString(),
        from: startNode,
        to: nodeId,
        style: 'dashed',
        weight: 2,
      };
      const newConnections = [...connections, newConnection];
      setConnections(newConnections);
      saveToHistory({ nodes, connections: newConnections });
      addActionLog('Connection Created', `Connected "${fromNode?.text}" to "${toNode?.text}"`);
    }
    setIsDragging(false);
    setIsConnecting(false);
    setStartNode(null);
  };

  const handleConnectClick = () => {
    if (isConnecting) {
      setIsConnecting(false);
      setStartNode(null);
    } else {
      setIsConnecting(true);
      setStartNode(selectedNode);
    }
  };

  const handleCanvasClick = (e: React.MouseEvent) => {
    if (isConnecting) {
      setIsConnecting(false);
      setStartNode(null);
      return;
    }

    const rect = e.currentTarget.getBoundingClientRect();
    addNode(e.clientX - rect.left, e.clientY - rect.top);
  };

  const handleCanvasMouseUp = () => {
    setIsDragging(false);
  };

  const handleZoom = (delta: number) => {
    setScale(prev => Math.max(0.5, Math.min(2, prev + delta)));
  };

  useEffect(() => {
    const handleMouseUp = () => {
      setIsDragging(false);
    };

    window.addEventListener('mouseup', handleMouseUp);
    return () => window.removeEventListener('mouseup', handleMouseUp);
  }, []);

  // Get connected nodes for a given node
  const getConnectedNodes = (nodeId: string) => {
    const connectedNodes = connections
      .filter(conn => conn.from === nodeId || conn.to === nodeId)
      .map(conn => {
        const connectedId = conn.from === nodeId ? conn.to : conn.from;
        return nodes.find(n => n.id === connectedId);
      })
      .filter((node): node is Node => node !== undefined);
    return connectedNodes;
  };

  const startEditing = (node: Node) => {
    setEditingNode(node.id);
    setEditText(node.text);
  };

  const saveEdit = (nodeId: string) => {
    const newNodes = nodes.map(node =>
      node.id === nodeId ? { ...node, text: editText } : node
    );
    setNodes(newNodes);
    saveToHistory({ nodes: newNodes, connections });
    setEditingNode(null);
  };

  const cancelEdit = () => {
    setEditingNode(null);
  };

  return (
    <div className="flex gap-4">
      <div className="flex-1 space-y-6">
        <GlowingEffect gradient="linear-gradient(270deg, #a78bfa 0%, #6366f1 50%, #3b82f6 100%)">
          <SectionHeader
            title="Mind Map Canvas"
            subtitle="Visualize your thoughts and connections"
            icon={Brain}
            center
            divider
          >
            <div className="mt-6">
              <div className="bg-white/5 rounded-lg p-4 text-gray-400">
                Click anywhere on the canvas to add new nodes. Drag nodes to connect ideas.
              </div>
            </div>
          </SectionHeader>
        </GlowingEffect>

        <div className="flex gap-4 mb-4">
          <button
            onClick={handleConnectClick}
            disabled={!selectedNode}
            className={`px-4 py-2 rounded-lg flex items-center gap-2 ${
              isConnecting
                ? 'bg-violet-600 text-white'
                : 'bg-white/10 text-gray-300 hover:bg-white/20'
            }`}
          >
            {isConnecting ? (
              <>
                <X className="w-4 h-4" />
                Cancel Connection
              </>
            ) : (
              <>
                <Link2 className="w-4 h-4" />
                Connect Nodes
              </>
            )}
          </button>

          <button
            onClick={saveMindMap}
            className="px-4 py-2 rounded-lg flex items-center gap-2 bg-white/10 text-gray-300 hover:bg-white/20"
          >
            <Save className="w-4 h-4" />
            Save
          </button>

          <button
            onClick={loadMindMap}
            className="px-4 py-2 rounded-lg flex items-center gap-2 bg-white/10 text-gray-300 hover:bg-white/20"
          >
            <Upload className="w-4 h-4" />
            Load
          </button>

          <button
            onClick={undo}
            disabled={historyIndex <= 0}
            className="px-4 py-2 rounded-lg flex items-center gap-2 bg-white/10 text-gray-300 hover:bg-white/20 disabled:opacity-50"
          >
            <Undo className="w-4 h-4" />
            Undo
          </button>

          <button
            onClick={redo}
            disabled={historyIndex >= history.length - 1}
            className="px-4 py-2 rounded-lg flex items-center gap-2 bg-white/10 text-gray-300 hover:bg-white/20 disabled:opacity-50"
          >
            <Redo className="w-4 h-4" />
            Redo
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={() => handleZoom(-0.1)}
              className="p-2 rounded-lg bg-white/10 text-gray-300 hover:bg-white/20"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <span className="text-gray-300">{Math.round(scale * 100)}%</span>
            <button
              onClick={() => handleZoom(0.1)}
              className="p-2 rounded-lg bg-white/10 text-gray-300 hover:bg-white/20"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div
          ref={canvasRef}
          className={`relative w-full h-[600px] bg-white/5 rounded-lg border border-white/20 ${
            isConnecting ? 'cursor-not-allowed' : 'cursor-crosshair'
          }`}
          onClick={handleCanvasClick}
          onMouseUp={handleCanvasMouseUp}
          style={{
            transform: `scale(${scale})`,
            transformOrigin: 'center center',
          }}
        >
          {/* Draw connections */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none">
            {connections.map(conn => {
              const fromNode = nodes.find(n => n.id === conn.from);
              const toNode = nodes.find(n => n.id === conn.to);
              if (!fromNode || !toNode) return null;

              return (
                <line
                  key={conn.id}
                  x1={fromNode.x}
                  y1={fromNode.y}
                  x2={toNode.x}
                  y2={toNode.y}
                  stroke="rgba(255, 255, 255, 0.3)"
                  strokeWidth={conn.weight}
                  strokeDasharray={conn.style === 'dashed' ? '5,5' : conn.style === 'dotted' ? '2,2' : 'none'}
                />
              );
            })}
          </svg>

          {/* Render nodes */}
          {nodes.map((node) => (
            <div
              key={node.id}
              className={`absolute transform -translate-x-1/2 -translate-y-1/2 ${
                selectedNode === node.id ? 'ring-2 ring-violet-500' : ''
              } ${isConnecting && node.id === startNode ? 'ring-2 ring-violet-500 ring-opacity-50' : ''}`}
              style={{ left: node.x, top: node.y }}
              onMouseDown={(e) => handleNodeMouseDown(node.id, e)}
              onMouseUp={(e) => handleNodeMouseUp(node.id, e)}
              onMouseMove={(e) => handleNodeDrag(node.id, e)}
            >
              <div className={`bg-gradient-to-r ${node.color} backdrop-blur-sm rounded-lg shadow-lg border border-white/20 ${NODE_SIZES[node.size]}`}>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={node.text}
                    onChange={(e) => {
                      const newNodes = nodes.map((n) =>
                        n.id === node.id ? { ...n, text: e.target.value } : n
                      );
                      setNodes(newNodes);
                      saveToHistory({ nodes: newNodes, connections });
                    }}
                    className="bg-transparent border-none focus:ring-0 text-gray-300 placeholder-gray-400 w-full"
                    placeholder="Enter text..."
                    onClick={(e) => e.stopPropagation()}
                  />
                  <div className="flex items-center gap-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        updateNodeStyle(node.id, {
                          size: node.size === 'small' ? 'medium' : node.size === 'medium' ? 'large' : 'small'
                        });
                      }}
                      className="p-1 text-gray-400 hover:text-gray-300 transition-colors"
                    >
                      <Type className="w-4 h-4" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        updateNodeStyle(node.id, {
                          color: NODE_COLORS[Math.floor(Math.random() * NODE_COLORS.length)].gradient
                        });
                      }}
                      className="p-1 text-gray-400 hover:text-gray-300 transition-colors"
                    >
                      <Palette className="w-4 h-4" />
                    </button>
                    <button
                      onClick={(e) => deleteNode(node.id, e)}
                      className="p-1 text-gray-400 hover:text-red-400 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Node Content Sidebar */}
      <div className={`w-80 bg-white/5 rounded-lg border border-white/20 transition-all duration-300 ${isSidebarOpen ? 'opacity-100' : 'opacity-0 w-0'}`}>
        <div className="p-4 border-b border-white/20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-gray-300" />
            <h3 className="text-gray-300 font-medium">Node Content</h3>
          </div>
          <button
            onClick={() => setIsSidebarOpen(false)}
            className="p-1 text-gray-400 hover:text-gray-300 transition-colors"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
        <div className="h-[calc(100vh-300px)] overflow-y-auto p-4 space-y-4">
          {nodes.map((node) => (
            <div
              key={node.id}
              className={`p-4 rounded-lg border border-white/20 ${
                selectedNode === node.id ? 'bg-white/10' : 'bg-white/5'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                {editingNode === node.id ? (
                  <div className="flex-1 flex items-center gap-2">
                    <input
                      type="text"
                      value={editText}
                      onChange={(e) => setEditText(e.target.value)}
                      className="flex-1 bg-white/10 border border-white/20 rounded px-2 py-1 text-gray-300 focus:outline-none focus:border-violet-500"
                      autoFocus
                    />
                    <button
                      onClick={() => saveEdit(node.id)}
                      className="p-1 text-emerald-400 hover:text-emerald-300 transition-colors"
                    >
                      <Check className="w-4 h-4" />
                    </button>
                    <button
                      onClick={cancelEdit}
                      className="p-1 text-red-400 hover:text-red-300 transition-colors"
                    >
                      <XIcon className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <>
                    <h4 className="text-gray-300 font-medium flex-1">{node.text}</h4>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => startEditing(node)}
                        className="p-1 text-gray-400 hover:text-gray-300 transition-colors"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={(e) => deleteNode(node.id, e)}
                        className="p-1 text-gray-400 hover:text-red-400 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </>
                )}
              </div>

              <div className="flex items-center gap-2 mt-2">
                <button
                  onClick={() => updateNodeStyle(node.id, {
                    size: node.size === 'small' ? 'medium' : node.size === 'medium' ? 'large' : 'small'
                  })}
                  className={`px-2 py-1 rounded text-xs ${
                    node.size === 'small' ? 'bg-white/10' : 'bg-white/5'
                  } text-gray-300 hover:bg-white/10 transition-colors`}
                >
                  Small
                </button>
                <button
                  onClick={() => updateNodeStyle(node.id, {
                    size: node.size === 'medium' ? 'large' : 'medium'
                  })}
                  className={`px-2 py-1 rounded text-xs ${
                    node.size === 'medium' ? 'bg-white/10' : 'bg-white/5'
                  } text-gray-300 hover:bg-white/10 transition-colors`}
                >
                  Medium
                </button>
                <button
                  onClick={() => updateNodeStyle(node.id, {
                    size: node.size === 'large' ? 'small' : 'large'
                  })}
                  className={`px-2 py-1 rounded text-xs ${
                    node.size === 'large' ? 'bg-white/10' : 'bg-white/5'
                  } text-gray-300 hover:bg-white/10 transition-colors`}
                >
                  Large
                </button>
              </div>

              <div className="flex items-center gap-2 mt-2">
                {NODE_COLORS.map((color) => (
                  <button
                    key={color.name}
                    onClick={() => updateNodeStyle(node.id, { color: color.gradient })}
                    className={`w-6 h-6 rounded-full ${
                      node.color === color.gradient ? 'ring-2 ring-violet-500' : ''
                    }`}
                    style={{
                      background: `linear-gradient(to right, ${color.from}, ${color.to})`
                    }}
                    title={color.name}
                  />
                ))}
              </div>
              
              {/* Connected Nodes */}
              {getConnectedNodes(node.id).length > 0 && (
                <div className="mt-3">
                  <h5 className="text-sm text-gray-400 mb-2">Connected to:</h5>
                  <div className="space-y-2">
                    {getConnectedNodes(node.id).map((connectedNode) => (
                      <div
                        key={connectedNode.id}
                        className="text-sm text-gray-300 bg-white/5 p-2 rounded"
                      >
                        {connectedNode.text}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Sidebar Toggle Button */}
      {!isSidebarOpen && (
        <button
          onClick={() => setIsSidebarOpen(true)}
          className="fixed right-4 top-1/2 transform -translate-y-1/2 p-2 bg-white/10 rounded-lg text-gray-300 hover:bg-white/20 transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
      )}
    </div>
  );
};

export default MindMapCanvas; 