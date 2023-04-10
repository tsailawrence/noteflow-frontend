import React, { useCallback, useState, useRef , useEffect} from "react";
import ReactFlow, {
  Position,
  Handle,
  Controls,
  Background,
  MiniMap,
  ReactFlowProvider,
  useNodesState,
  useEdgesState,
  addEdge,
  updateEdge,
  useReactFlow,
  getIncomers,
  getOutgoers,
  getConnectedEdges,
} from "reactflow";
import CustomNode from "../../Components/Flow/Node";
import ToolBar from "../../Components/Flow/ToolBar";
import StyleBar from "../../Components/Flow/StyleBar";
import Drawer from "@mui/material//Drawer";
import Editor from "../../Components/Editor/Editor";
import PageTab from "../../Components/PageTab/PageTab";
import { useFlowStorage } from "../../storage/Storage";
import { Navigate, useLocation } from "react-router-dom";



import _ from "lodash";


import "./Flow.scss";
import "reactflow/dist/style.css";

const nodeTypes = {
  CustomNode,
};

// const edgeTypes = {
//   CustomEdge
// }

const defaultNodeStyle = {
  border: '2px solid',
  background: 'white',
  borderRadius: 10,
  height: 50,
  width:150
};

function Flow(props) {
  const location = useLocation();
  const reactFlowInstance = useReactFlow();
  const xPos = useRef(50);
  const yPos = useRef(0);
  const nodeId = useRef(location.state.nextNodeId);

  const [bgVariant, setBgVariant] = useState("line");
  const [rfInstance, setRfInstance] = useState(null);
  const [edges, setEdges, onEdgesChange] = useEdgesState(location.state.edges);
  const [nodes, setNodes, onNodesChange] = useNodesState(location.state.nodes);
  const [title, setTitle]= useState(location.state.name);
  const [isStyleBarOpen, setIsStyleBarOpen] = useState(false);
  const [back, setBack] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [flowID, setFlowID] = useState(location.state.id);
  const saveFlow = useFlowStorage((state) => state.saveFlow);
  // const saveFlow = useFlowStorage((state) => state.saveFlow);


  
  const onConnect = useCallback((params) => {setEdges((eds) => addEdge(params, eds))}, [setEdges]);
  const onEdgeUpdate = useCallback((oldEdge, newConnection) => setEdges((els) => updateEdge(oldEdge, newConnection, els)),[]);

  const onNodesDelete = useCallback(
    (deleted) => {
      setEdges(
        deleted.reduce((acc, node) => {
          const incomers = getIncomers(node, nodes, edges);
          const outgoers = getOutgoers(node, nodes, edges);
          const connectedEdges = getConnectedEdges([node], edges);
          const remainingEdges = acc.filter((edge) => !connectedEdges.includes(edge));
          const createdEdges = incomers.flatMap(({ id: source }) =>
            outgoers.map(({ id: target }) => ({ id: `${source}->${target}`, source, target }))
          );

          return [...remainingEdges, ...createdEdges];
        }, edges)
      );
    },
    [nodes, edges]
  );


  const addNode = () => {

    yPos.current += 50;
    if(yPos.current > 400){
      yPos.current = 50
      xPos.current +=150
    }
    const newNode =  {
      id: (nodeId.current + 1).toString(),      
      data: { label: "Untitled", toolbarPosition:Position.Top},
      type: "CustomNode",
      position: { x: xPos.current, y: yPos.current},
      style: defaultNodeStyle,   
      // copyNode: (id)=>{copyNode(id)}, changeStyle:(id)=>{changeStyle(id)}
    };

    setNodes([...nodes, newNode]);
    nodeId.current += 1;
  };

  const changeStyle = () => {
    setIsStyleBarOpen(true);
  }

  const onSave = useCallback((title) => {
    if (rfInstance) {
      const flow = rfInstance.toObject();
      setBack(true);
      saveFlow({id: flowID, flow: flow, nextNodeId: nodeId.current+1, title: title});
      //connect to backend
    }

  }, [rfInstance]);

  const handleDrawerClose = ()=>{
    setIsEdit(false);
  }
  const onNodeDoubleClick = (event, node)=>{
    //open editor by nodeID    
    console.log(node.id)
    setIsEdit(true)
  }

  const copyNode = (id) => {    
    yPos.current += 50;
    if(yPos.current > 400){
      yPos.current = 50
      xPos.current +=150
    }
    let copy =  _.cloneDeep(rfInstance.toObject().nodes.find(nds => nds.id == id) )
  
    copy.position = {x: xPos.current, y: yPos.current}
    copy.id = nodeId.current + 1;
    // setNextNodeId({id: flowID, nextNodeId: nodeId.current + 1});
    setNodes([...rfInstance.toObject().nodes, copy]);
  }

  return (
    <div className="FlowEditPanel">
      {!back ?
      <>
        <ToolBar flowTitle = {title} addNode={addNode} onSave = {onSave} changeBackground={(bgStyle)=>{setBgVariant(bgStyle)}}/>
        <ReactFlow
          className="NodePanel"
          nodes={nodes}
          edges={edges}
          onNodesDelete={onNodesDelete}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onEdgeUpdate={onEdgeUpdate}
          onConnect={onConnect}
          onInit={setRfInstance}
          onNodeDoubleClick={onNodeDoubleClick}
          nodeTypes={nodeTypes}
          // edgeTypes={edgeTypes}
        >
          {isStyleBarOpen?<StyleBar isOpen={isStyleBarOpen}/>:null}
          <MiniMap nodeStrokeWidth={10} zoomable pannable />
          <Controls />
          <Background color="#ccc" variant={bgVariant} />
        </ReactFlow>
      </>
      : <Navigate to="/home"/>}
      {isEdit &&
        <div className="EditorContainer" >
          <Drawer
            sx={{
              width: "60%",
              flexShrink: 0,
              '& .MuiDrawer-paper': {
                width:  "60%",
              },
            }}
            variant="persistent"
            anchor="right"
            open={open}
          >
            <Editor handleDrawerClose={handleDrawerClose}/>
          </Drawer>
          {/* <Editor id={editID}/> */}
        </div>}
    </div>
  );
}

function FlowWithProvider(...props) {
  return (
    <div className = "FlowContainer">
      <PageTab/>
      <ReactFlowProvider >
        <Flow {...props} />
      </ReactFlowProvider>
    </div>
  );
}

export default FlowWithProvider;